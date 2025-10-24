import { Request, Response, NextFunction } from 'express'
import * as skillService from '../services/skill.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'
// import prisma from '../db.config'/

// Create skill
export const createSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body
    const userId = (req as any).user?.id || req.body.userId // temporary if no auth yet
    if (!name) throw new BadRequestError('Skill name is required')

    const skill = await skillService.createSkill(name, userId)
    return successMessage({
      res,
      data: skill,
      message: 'Skill created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// search skills
export const searchSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query // example: /api/skills/search?q=react
    if (!query) throw new BadRequestError('Search query is required')

    // const query = req.params.query?.trim() // send your search term as a URL parameter (/search/:query)
    // if (!query) throw new BadRequestError('Search query is required')

    const skills = await skillService.searchSkills(query as string)
    if (!skills.length)
      throw new NotFoundError('No skill found matching your search')
    return successMessage({
      res,
      data: skills,
      message: 'Skills search completed successfully',
    })
  } catch (error) {
    next(error)
  }
}

// List all skills
export const getAllSkills = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const skills = await skillService.getAllSkills()
    return successMessage({
      res,
      data: skills,
      message: 'Skills retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Get user’s skills
export const getUserSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id || req.params.userId || req.body.userId

    if (!userId) throw new BadRequestError('User ID is required')

    const skills = await skillService.getSkillsByUserId(userId)
    return successMessage({
      res,
      data: skills,
      message: 'Skills retrieved successfully',
    })
  } catch (error) {
    // res.status(400).json({ error: error.message })
    next(error)
  }
}

// Assign skill to user
export const assignSkillToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, skillId } = req.body
    if (!userId || !skillId)
      throw new BadRequestError('userId and skillId are required')

    const user = await skillService.assignSkillToUser(userId, skillId)
    if (!user) throw new NotFoundError('User or skill not found')

    return successMessage({
      res,
      data: user,
      message: 'Skill assigned to user successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const removeSkillFromUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId
    if (!userId) throw new BadRequestError('userId is required')
    const { skillId } = req.params
    if (!skillId) throw new BadRequestError('skillId is required')

    const updatedUser = await skillService.removeSkillFromUser(userId, skillId)
    return successMessage({
      res,
      data: updatedUser,
      message: 'Skill removed successfully',
      // res
      //   .status(200)
      //   .json({ message: 'Skill removed successfully', user: updatedUser })
      })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

// Update skill name (admin-only)
export const updateSkillName = async (req: Request, res: Response) => {
  try {
    // In future: check if user.role === 'ADMIN'
    const { skillId } = req.params
    const { name } = req.body

    if (!skillId) throw new BadRequestError('skillId is required')
    if (!name) throw new BadRequestError('name is required')

    const updatedSkill = await skillService.updateSkillName(skillId, name)
    // res.status(200).json({ message: 'Skill name updated', skill: updatedSkill })

    return successMessage({
      res,
      data: updatedSkill,
      message: 'Skill name updated successfully',
      })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
