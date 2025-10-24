import { Router } from "express";
import * as projectController from "../controllers/project.controller";

const router = Router();

router.post('/', projectController.createProject)
router.get('/search', projectController.searchProjects) // <--- move this up
router.get('/', projectController.getAllProjects)
router.get('/client/:clientId', projectController.getProjectsByClient)
router.get('/:id', projectController.getProjectById)
router.put('/:id', projectController.updateProject)
router.delete('/:id', projectController.deleteProject)


export default router;
