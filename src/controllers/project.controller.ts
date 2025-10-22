import * as projectService from '../services/project.service';
import { successMessage } from '../utils/successMessage';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotFoundError } from '../utils/errorHandler';

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, budget, clientId } = req.body
    if (!title || !description || !budget || !clientId)
      throw new BadRequestError('Missing required fields')

    const project = await projectService.createProject({
      title,
      description,
      budget,
      clientId,
    })
    return successMessage({
      res,
      data: project,
      message: 'Project created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
};

export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await projectService.getAllProjects();
    return successMessage({
      res,
      data: projects,
      message: 'Projects retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Missing project id'); 

    const project = await projectService.getProjectById(id);
    if (!project) throw new NotFoundError('Project not found');

    return successMessage({
      res,
      data: project,
      message: 'Project retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Missing project id');

    const project = await projectService.updateProject(id, req.body);
    if (!project) throw new NotFoundError('Project not found');

    return successMessage({
      res,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Missing project id');

    const project = await projectService.deleteProject(id);
    if (!project) throw new NotFoundError('Project not found');

    return successMessage({
      res,
      data: project,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
