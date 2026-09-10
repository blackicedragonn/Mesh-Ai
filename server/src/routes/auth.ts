import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rate-limit.js';

const authRouter = Router();

authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.get('/me', auth, getCurrentUser);

export { authRouter };
