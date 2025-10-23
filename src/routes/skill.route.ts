import { Router } from 'express'
import * as skillController from '../controllers/skill.controller'

const router = Router()

// Create new skill (auto-assigns to creator)
router.post('/', skillController.createSkill)

// Get all skills
router.get('/', skillController.getAllSkills)

// Get specific user’s skills
router.get('/user/:userId', skillController.getUserSkills)

// Assign a skill to user
router.post('/assign', skillController.assignSkillToUser)

// Remove skill from user
router.delete('/remove/:skillId', skillController.removeSkillFromUser)

// Update skill name (admin-only)
router.put('/:skillId', skillController.updateSkillName)

// Searching skills auto-suggest
router.get('/search', skillController.searchSkills)

export default router;
