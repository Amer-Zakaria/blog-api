import { NextFunction, Request, Response } from "express";
import extractErrorMessagesZod from "./../util/extractErrorMessagesZod";
import { z } from "zod";

export default function validateReq(
  schema: z.ZodObject<any>,
  part: "body" | "query"
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const result = schema.safeParse(req[part]);
    if (result.error) {
      return res.status(400).json({
        validation: extractErrorMessagesZod(result.error),
      });
    }

    if (part === "body") res.locals.data = result.data;

    next();
  };
}
