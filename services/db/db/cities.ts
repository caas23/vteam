import { Request, Response } from 'express';
import { getCollection } from './collections';

export const getCities = async (req: Request, res: Response) => {
  const cities = await getCollection('cities').find().toArray();
  res.json(cities);
};