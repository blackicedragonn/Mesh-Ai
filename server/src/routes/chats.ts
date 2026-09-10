import { Router } from 'express';
import { createChat, getChats, getChat, deleteChat } from '../controllers/chats.js';
import { createMessage } from '../controllers/messages.js';
import { auth } from '../middleware/auth.js';

const chatsRouter = Router();

chatsRouter.use(auth);

chatsRouter.get('/', getChats);
chatsRouter.post('/', createChat);
chatsRouter.get('/:id', getChat);
chatsRouter.delete('/:id', deleteChat);
chatsRouter.post('/:id/messages', createMessage);

export { chatsRouter };
