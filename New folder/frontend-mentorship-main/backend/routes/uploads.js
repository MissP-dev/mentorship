import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { upload, toUploadUrl } from '../uploads.js';

const router = Router();
router.use(requireAuth);

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  res.status(201).json({ url: toUploadUrl(req.file) });
});

export default router;
