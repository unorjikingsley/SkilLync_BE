import { BadRequestError, NotFoundError } from '../utils/errorHandler'
import prisma from '../db.config'
import { Skill, User } from '@prisma/client'

// Create a new skill
export const createSkill = async (
  name: string,
  userId: string
): Promise<Skill> => {
  try {
    const capitalizedName = name.trim().toUpperCase()

    // (optional) Check if user is valid
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    })
    if (!user) throw new NotFoundError('Invalid user')

    let skill = await prisma.skill.findUnique({
      where: { name: capitalizedName },
    })

    if (skill) {
      throw new BadRequestError(
        'Skill already exists. Please select it from suggestions.'
      )
    }

    //If not found, create new skill and assign it to user
    skill = await prisma.skill.create({
      data: { name: capitalizedName },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        skills: {
          connect: { id: skill.id },
        },
      },
    })
    return skill
  } catch (error) {
    console.error('Error Creating Skills:', error)
    throw new BadRequestError(error instanceof Error ? error.message : 'Unknown error')
  }
}

// Get all skills
export const getAllSkills = async (): Promise<Skill[]> => {
  return prisma.skill.findMany({
    orderBy: { name: 'asc' },
  })
}

// Assign skill to user
export const assignSkillToUser = async (userId: string, skillId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { skills: true },
  })
  if (!user) throw new NotFoundError('User not found')

  const skill = await prisma.skill.findUnique({ where: { id: skillId } })
  if (!skill) throw new NotFoundError('Skill not found')

  // Ensure not already assigned
  const alreadyAssigned = user.skills.some((s) => s.id === skillId)
  if (alreadyAssigned) throw new BadRequestError('Skill is already assigned')

  // Assign
  return prisma.user.update({
    where: { id: userId },
    data: {
      skills: {
        connect: { id: skillId },
      },
    },
    include: { skills: true },
  })
}

// Get all skills of a specific user
export const getSkillsByUserId = async (userId: string): Promise<Skill[]> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { skills: true },
  })
  if (!user) throw new NotFoundError('User not found')

  return user.skills;
}

// Remove (disconnect) a skill from user’s profile
export const removeSkillFromUser = async (userId: string, skillId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true },
  })
  if (!user) throw new NotFoundError('User not found')

  const skillExists = user.skills.some((s) => s.id === skillId)
  if (!skillExists) throw new NotFoundError('Skill not found in user profile')

  return prisma.user.update({
    where: { id: userId },
    data: {
      skills: {
        disconnect: { id: skillId },
      },
    },
    include: { skills: true },
  })
}

// Update a skill name (admin only)
export const updateSkillName = async (
  skillId: string,
  newName: string
): Promise<Skill> => {
  try {
    const formattedName = newName.trim().toUpperCase()

    const existingSkill = await prisma.skill.findUnique({
      where: { id: skillId },
    })
    if (!existingSkill) {
      throw new Error('Skill not found')
    }

    if (existingSkill.name === formattedName) {
      throw new Error('No changes detected — skill name is the same')
    }

    return await prisma.skill.update({
      where: { id: skillId },
      data: { name: formattedName || existingSkill.name },
    })
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update skill')
  }
}

export const searchSkills = async (query: string): Promise<Skill[]> => {
  if (!query.trim()) throw new BadRequestError('Search skill cannot be empty')

  const skill = await prisma.skill.findMany({
    where: {
      name: {
        contains: query.trim().toUpperCase(), // match partial text in uppercase
        mode: 'insensitive', // case-insensitive search
      },
    },
    orderBy: { name: 'desc' },
  })

  if (!skill.length)
    throw new NotFoundError('No gigs found matching your search')

  return skill;
}
