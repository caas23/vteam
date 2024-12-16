import { Request, Response } from 'express';
import { getCollection } from './collections';

export const getUsers = async (req: Request, res: Response) => {
  const users = await getCollection('users').find().toArray();
  res.json(users);
};