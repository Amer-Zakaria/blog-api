import { Schema, model } from "mongoose";
import { z } from "zod";

const status = ["draft", "published", "archived"] as const;

const blogSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 1000,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 10000,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: status,
        message: "{VALUE} is not supported",
      },
      default: "published",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      require: true,
    },
  },
  { versionKey: false, timestamps: true }
);

export const Blog = model("Blogs", blogSchema);

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateBlogInput:
 *      type: object
 *      required:
 *        - title
 *        - content
 *      properties:
 *        title:
 *          type: string
 *          minLength: 5
 *          maxLength: 1000
 *        content:
 *          type: string
 *          minLength: 5
 *          maxLength: 10000
 *        status:
 *          type: string
 *          default: published
 *    CreateBlogResponse:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        title:
 *          type: string
 *        content:
 *          type: string
 *        status:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 *        author:
 *          $ref: '#/components/schemas/CreateUserResponse'
 */
export const createBlogSchema = z
  .object({
    title: z.string().min(5).max(1000),
    content: z.string().min(5).max(10000),
    status: z.enum(status).optional(),
  })
  .strict();

/**
 * @openapi
 * components:
 *  schemas:
 *    UpdateBlogInput:
 *      type: object
 *      required:
 *        - title
 *        - content
 *      properties:
 *        title:
 *          type: string
 *          minLength: 5
 *          maxLength: 1000
 *        content:
 *          type: string
 *          minLength: 5
 *          maxLength: 10000
 *        status:
 *          type: string
 *          default: published
 *    UpdateBlogResponse:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        title:
 *          type: string
 *        content:
 *          type: string
 *        status:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 *        author:
 *          $ref: '#/components/schemas/CreateUserResponse'
 */
export const updateBlogSchema = z
  .object({
    title: z.string().min(5).max(1000),
    content: z.string().min(5).max(10000),
    status: z.enum(status).optional(),
  })
  .strict();

export type ICreateBlog = z.infer<typeof createBlogSchema>;
export type IUpdateBlog = z.infer<typeof updateBlogSchema>;
