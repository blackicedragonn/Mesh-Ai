import type { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';
import Document from '../models/document.js';
import Chunk from '../models/chunk.js';
import { chunkText } from '../utils/chunk.js';
import { createEmbedding } from '../utils/embeddings.js';
import { getCacheValue, setCacheValue, deleteCacheValue } from '../utils/cache.js';

export const uploadDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      data: null,
      error: { message: 'File is required' },
    });
    return;
  }

  const userId = req.user!.userId;

  const buffer = readFileSync(req.file.path);
  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();

  const chunks = chunkText(text);

  const title = req.body.title || req.file.originalname;

  const document = await Document.create({
    title,
    fileName: req.file.originalname,
    userId,
  });

  await Promise.all(
    chunks.map(async (chunkPiece) => {
      const embedding = await createEmbedding(chunkPiece);
      return Chunk.create({
        documentId: document._id,
        text: chunkPiece,
        embedding,
      });
    }),
  );

  deleteCacheValue(`documents-list:${userId}`);

  res.status(201).json({
    success: true,
    data: document,
    error: null,
  });
};

export const getDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const cacheKey = `documents-list:${userId}`;
  const cached = getCacheValue(cacheKey);

  if (cached) {
    res.status(200).json(cached);
    return;
  }

  const documents = await Document.find({ userId });

  const responseData = {
    success: true,
    data: documents,
    error: null,
  };
  setCacheValue(cacheKey, responseData, 30 * 1000);

  res.status(200).json(responseData);
};

export const deleteDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const document = await Document.findOne({ _id: id, userId });

  if (!document) {
    res.status(404).json({
      success: false,
      data: null,
      error: { message: 'Document not found' },
    });
    return;
  }

  await Chunk.deleteMany({ documentId: document._id });
  await Document.deleteOne({ _id: id });

  deleteCacheValue(`documents-list:${userId}`);

  res.status(204).send();
};
