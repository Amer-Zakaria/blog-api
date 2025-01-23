import mongoose, { Schema } from "mongoose";
import { z } from "zod";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024, //after hashing the pass, it takes up to 1024
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const User = mongoose.model("Users", userSchema);

const passwordValidation = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least 1 uppercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
  .refine((val) => !/\s/.test(val), {
    message: "Password must not contain white spaces",
  });

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
 *      properties:
 *        name:
 *          type: string
 *          default: Jane Doe
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        password:
 *          type: string
 *          default: StringPassword123!
 *    CreateUserResponse:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        isAdmin:
 *          type: boolean
 */
export const createUserSchema = z
  .object({
    name: z.string().min(5).max(50),
    email: z.string().email().min(5).max(255),
    password: passwordValidation,
  })
  .strict();

/**
 * @openapi
 * components:
 *  schemas:
 *    UserCredentialsInput:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        password:
 *          type: string
 *          default: StringPassword123!
 *    UserCredentialsResponse:
 *      type: string
 */
export const userCredSchema = z
  .object({
    email: z.string().min(5).max(255).email(),
    password: passwordValidation,
  })
  .strict();

export default User;

export type ICreateUser = z.infer<typeof createUserSchema>;
export type IUserCred = z.infer<typeof userCredSchema>;
