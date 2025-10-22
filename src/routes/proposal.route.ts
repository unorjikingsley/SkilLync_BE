import { Router } from "express";
import * as proposalController from "../controllers/proposal.controller";

const router = Router();

router.post("/", proposalController.submitProposal);
router.get("/", proposalController.getAllProposals);
router.get("/:id", proposalController.getProposalById);
router.put("/:id", proposalController.updateProposal);
router.delete("/:id", proposalController.deleteProposal);

export default router;
