import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authz(req: Request, res: Response, next: NextFunction): any {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(
      token.trim(),
      process.env.JWT_PRIVATE_KEY as string
    );
    res.locals.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send({ message: "Invalid token." });
  }
}
