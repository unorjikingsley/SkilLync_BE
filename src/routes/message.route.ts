import { Router } from 'express'
import * as messageController from '../controllers/message.controller';

const router = Router();

// Send a message
router.post('/', messageController.createMessage)

// List messages
router.get('/', messageController.getAllMessages)
router.get('/conversation/:userId1/:userId2', messageController.getConversation)
router.get('/sender/:senderId', messageController.getMessagesBySender)
router.patch('/:id/edit', messageController.editMessage)
router.delete('/:id', messageController.deleteMessage)

export default router;
