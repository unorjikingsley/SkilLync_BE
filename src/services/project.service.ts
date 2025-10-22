import { Project, ProjectStatus } from "@prisma/client";
import prisma from "../db.config";

interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  clientId: string;
}

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  return prisma.project.create({ data: {
    ...data,
    status: ProjectStatus.OPEN,
  } });
};

export const getAllProjects = async (): Promise<Project[]> => {
  return prisma.project.findMany();
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  return prisma.project.findUnique({ where: { id } });
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project | null> => {
  return prisma.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string): Promise<Project | null> => {
  return prisma.project.delete({ where: { id } });
};
