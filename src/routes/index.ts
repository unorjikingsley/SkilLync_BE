import { Router } from 'express'
import userRoutes from './user.route'
import skillRoutes from './skill.route'
import gigRoutes from './gig.route'
import projectRoutes from './project.route';

const router = Router()

// Create a sub-router for API versioning or prefix
const apiRouter = Router()

apiRouter.use('/users', userRoutes)
apiRouter.use('/skills', skillRoutes)
apiRouter.use('/gigs', gigRoutes)
apiRouter.use('/projects', projectRoutes);

// Mount the API router under /api
router.use('/api', apiRouter)

export default router;
