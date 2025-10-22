import { Request, Response, NextFunction } from 'express'
import * as skillService from '../services/skill.service';
import { successMessage } from '@utils/successHandler';
import { BadRequestError, NotFoundError } from '../utils/errorHandler';

// Create skill
export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) throw new BadRequestError('Skill name is required');

    const skill = await skillService.createSkill(name);
    return successMessage({ res, data: skill, message: 'Skill created successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// List all skills
export const getAllSkills = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await skillService.getAllSkills();
    return successMessage({ res, data: skills, message: 'Skills retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign skill to user
export const assignSkillToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, skillId } = req.body;
    if (!userId || !skillId) throw new BadRequestError('userId and skillId are required');

    const user = await skillService.assignSkillToUser(userId, skillId);
    if (!user) throw new NotFoundError('User or skill not found');

    return successMessage({ res, data: user, message: 'Skill assigned to user successfully' });
  } catch (error) {
    next(error);
  }
};
