import express from 'express';
import { register, login } from '../controllers/authController';
import { validateUserRegistration, validateLogin } from '../middleware/validators';

const router = express.Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateLogin, login);

export default router;