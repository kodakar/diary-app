import express from 'express';
import { createDiary, getDiaries, getDiary, updateDiary, deleteDiary } from '../controllers/diaryController';

const router = express.Router();

router.post('/', createDiary);
router.get('/', getDiaries);
router.get('/:id', getDiary);
router.put('/:id', updateDiary);
router.delete('/:id', deleteDiary);

export default router;