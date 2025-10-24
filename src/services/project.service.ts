import { Project, ProjectStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../utils/errorHandler";
import prisma from "../db.config";

interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  clientId: string;
}

// --- Create Project ---
export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  const { title, description, budget, clientId } = data

  // Validate budget
  if (budget <= 0) throw new BadRequestError('Budget must be greater than zero')

  // Check if client exists and is active
  const clientExists = await prisma.user.findUnique({
    where: { id: clientId, deletedAt: null },
  })
  if (!clientExists) throw new NotFoundError('Client (user) not found or is deactivated')

  // Prevent duplicate project title for same client
  const existingProject = await prisma.project.findFirst({
    where: {
      title: { equals: title.trim(), mode: 'insensitive' },
      clientId,
    },
  })
  if (existingProject)
    throw new BadRequestError('You already have a project with this title')

  // Create project
  return prisma.project.create({
    data: {
      title: title.trim().toUpperCase(),
      description: description.trim(),
      budget,
      clientId,
      status: ProjectStatus.OPEN,
    },
  })
}

export const getAllProjects = async (): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: { client: { deletedAt: null } },
    include: {
      client: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
    },
    orderBy: { id: 'desc' },
  })
  // if (projects.length === 0) throw new NotFoundError('No projects listed')
  return projects
}

// --- Get project by ID ---
export const getProjectById = async (id: string): Promise<Project> => {
  const project = await prisma.project.findFirst({
    where: { id, client: { deletedAt: null } },
    include: {
      client: { select: { firstName: true, lastName: true, profileImage: true } },
    },
  })
  if (!project) throw new NotFoundError('Project not found o')
  return project
}

// --- Get projects by client ---
export const getProjectsByClient = async (clientId: string): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: { clientId, client: { deletedAt: null } },
    orderBy: { id: 'desc' },
  })
  if (!projects.length) throw new NotFoundError('No projects found for this client')
  return projects
}

// --- Update project ---
export const updateProject = async (
  id: string,
  data: Partial<Project>
): Promise<Project> => {
  const existingProject = await prisma.project.findFirst({
    where: { id, client: { deletedAt: null } },
  })
  if (!existingProject)
    throw new NotFoundError('Project not found or client is deactivated')

  // Check if no changes detected
  if (
    data.title?.trim().toUpperCase() === existingProject.title.toUpperCase() &&
    data.description?.trim() === existingProject.description &&
    data.budget === existingProject.budget &&
    data.status === existingProject.status
  ) {
    throw new BadRequestError('No changes detected to update')
  }

  return prisma.project.update({
    where: { id },
    data: {
      title: data.title?.trim().toUpperCase() || existingProject.title,
      description: data.description?.trim() || existingProject.description,
      budget: data.budget ?? existingProject.budget,
      status: data.status || existingProject.status,
    },
  })
}

// --- Delete project ---
export const deleteProject = async (id: string): Promise<Project> => {
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) throw new NotFoundError('Project not found')
  return prisma.project.delete({ where: { id } })
}

// --- Search projects by title or description ---
export const searchProjects = async (query: string): Promise<Project[]> => {
  if (!query.trim()) throw new BadRequestError('Search query cannot be empty')

  const projects = await prisma.project.findMany({
    where: {
      client: { deletedAt: null },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      client: { 
        select: { firstName: true, lastName: true, profileImage: true } 
      },
    },
    orderBy: { id: 'desc' },
  })

  if (!projects.length)
    throw new NotFoundError('No projects found matching your search')

  return projects;
}
