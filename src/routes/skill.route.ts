import { Router } from 'express'
import * as skillController from '../controllers/skill.controller'

const router = Router()

router.post('/skills', skillController.createSkill) // Create skill
router.get('/skills', skillController.getAllSkills) // List skills
router.post('/skills/assign', skillController.assignSkillToUser) // Assign skill to user

export default router;
