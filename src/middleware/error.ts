import { NextFunction, Request, Response } from "express";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Unexpected Error: ", err);

  res.status(500).json({
    message: "🔴",
    err: { message: err.message, stack: err.stack },
  });
}
