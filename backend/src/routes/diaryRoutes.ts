import express from 'express';
import { createDiary, getDiaries, getDiary, updateDiary, deleteDiary } from '../controllers/diaryController';
import { auth } from '../middleware/auth';
import { validateDiaryEntry } from '../middleware/validators';

const router = express.Router();

router.post('/', auth, validateDiaryEntry, createDiary);
router.get('/', auth, getDiaries);
router.get('/:id', auth, getDiary);
router.put('/:id', auth, validateDiaryEntry, updateDiary);
router.delete('/:id', auth, deleteDiary);

export default router;