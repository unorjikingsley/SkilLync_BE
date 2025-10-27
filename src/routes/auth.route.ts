import { Router} from 'express'
import { AuthController } from '../controllers/auth.controllers'

const router = Router()

router.post('/register', AuthController.register)
router.get('/verify-email', AuthController.verifyEmail)
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)

export default router
