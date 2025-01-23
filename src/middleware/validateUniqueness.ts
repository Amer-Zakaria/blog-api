import { NextFunction, Request, Response } from "express";

export default function validateUniqueness(propertyName: string, Model: any) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const value = req.body[propertyName];

    const document = await Model.findOne({ [propertyName]: value });

    if (!document) return next();
    // Ignore the matched document if it's the same one that am updating
    else if (document._id.toString() === req.params.id) return next();

    return res.status(400).json({
      validation: {
        path: [propertyName],
        [propertyName]: `"${value}" already exists`,
      },
    });
  };
}
