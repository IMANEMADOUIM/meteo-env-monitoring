import express, { Request, Response, NextFunction } from 'express';

export const handleMethodNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendStatus(405);
};
