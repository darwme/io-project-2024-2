import express from 'express';
import { getPsoResult } from '../controllers/pso.js';

const router = express.Router();

router.get('/', getPsoResult);

export default router;