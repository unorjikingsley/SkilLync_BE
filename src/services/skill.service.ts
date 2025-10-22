import { PrismaClient } from '@prisma/client';
import { Skill } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new skill
export const createSkill = async (name: string): Promise<Skill> => {
  return prisma.skill.create({ data: { name } })
}

// Get all skills
export const getAllSkills = async (): Promise<Skill[]> => {
  return prisma.skill.findMany()
}

// Assign skill to user
export const assignSkillToUser = async (userId: string, skillId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true },
  })

  if (!user) throw new Error('User not found')

  const skill = await prisma.skill.findUnique({ where: { id: skillId } })
  if (!skill) throw new Error('Skill not found')

  // Connect skill to user
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
