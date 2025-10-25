import { Router } from "express";
import * as contractController from "../controllers/contract.controller";

const router = Router();

router.post('/', contractController.createContract)
router.get('/', contractController.getAllContracts)
router.get('/:id', contractController.getContractById)
router.get('/client/:clientId', contractController.getContractsByClientId)
router.get(
  '/freelancer/:freelancerId',
  contractController.getContractsByFreelancerId
)
router.patch('/:id/status', contractController.updateContractStatus)
router.delete('/:id', contractController.deleteContract)

export default router;