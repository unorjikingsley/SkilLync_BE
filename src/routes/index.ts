import { Router } from 'express';
import userRoutes from './user.route';
import skillRoutes from './skill.route';
import gigRoutes from './gig.route';
import projectRoutes from './project.route';
import proposalRoutes from './proposal.route';
import contractRoutes from './contract.route';
import messageRoutes from './message.route';
import reviewRoutes from './review.route';

const router = Router()

// Create a sub-router for API versioning or prefix
const apiRouter = Router()

apiRouter.use('/users', userRoutes)
apiRouter.use('/skills', skillRoutes)
apiRouter.use('/gigs', gigRoutes)
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/proposals', proposalRoutes);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/reviews', reviewRoutes);

// Mount the API router under /api
router.use('/api', apiRouter)

export default router;
