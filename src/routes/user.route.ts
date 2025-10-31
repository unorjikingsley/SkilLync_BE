import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router()

// router.post('/', userController.createUser)
router.get('/users', authenticateUser, userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

export default router;
