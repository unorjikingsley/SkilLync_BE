import { Router } from 'express';
import * as proposalController from '../controllers/proposal.controller';

const router = Router()

router.post('/', proposalController.createProposal)
router.get('/', proposalController.getAllProposals)
router.get('/:id', proposalController.getProposalById)
router.get(
  '/freelancer/:freelancerId',
  proposalController.getProposalsByFreelancer
)
router.get('/project/:projectId', proposalController.getProposalsByProject)
router.put('/:id/status', proposalController.updateProposalStatus)
router.delete('/:id', proposalController.deleteProposal)

export default router;
