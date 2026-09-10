import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from '../controllers/documents.js';
import { auth } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });

const documentsRouter = Router();

documentsRouter.use(auth);

documentsRouter.post('/', upload.single('file'), uploadDocument);
documentsRouter.get('/', getDocuments);
documentsRouter.delete('/:id', deleteDocument);

export { documentsRouter };
