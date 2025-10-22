import { Router } from 'express'
import * as messageController from '../controllers/message.controller';

const router = Router();

// Send a message
router.post('/', messageController.sendMessage);

// List messages
router.get('/user/:userId', messageController.getAllMessagesByUser); // All messages
router.get('/inbox/:userId', messageController.getInboxMessagesByUser); // Received only
router.get('/sent/:userId', messageController.getSentMessagesByUser); // Sent only

export default router;
