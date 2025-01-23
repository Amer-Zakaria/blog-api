import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export default async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check the id validity
  if (!Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "Invalid Document Id",
    });

  next();
};
