import { Router } from "express";
import * as contractController from "../controllers/contract.controller";

const router = Router();

router.post("/", contractController.createContract);
router.get("/", contractController.getAllContracts);
router.get("/:id", contractController.getContractById);
router.put("/:id", contractController.updateContract);
router.delete("/:id", contractController.deleteContract);

export default router;