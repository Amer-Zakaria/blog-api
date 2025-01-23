import express, { Request, Response } from "express";
import { authz } from "../middleware/authz";
import { admin } from "../middleware/admin";
import {
  Blog,
  createBlogSchema,
  ICreateBlog,
  IUpdateBlog,
  updateBlogSchema,
} from "../models/blog";
import validateReq from "../middleware/validateReq";
import validateUniqueness from "../middleware/validateUniqueness";
import paginationSchema, { IPaginationInput } from "../models/pagination";
import validateObjectId from "../middleware/validateObjectId";

const router = express.Router();

/**
 * @openapi
 * '/api/blogs':
 *   get:
 *     tags:
 *     - Blog
 *     summary: Get the blogs
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/paginationInput/pageNumber'
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/paginationInput/pageSize'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                blogs:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/CreateBlogResponse'
 *                paginationInfo:
 *                  $ref: '#components/schemas/paginationResponse'
 */
router.get(
  "/",
  [validateReq(paginationSchema, "query")],
  async (req: Request, res: Response) => {
    const pagination = req.query as IPaginationInput;
    const pageNumber = +(pagination.pageNumber ?? 1);
    const pageSize = +(pagination.pageSize ?? 10);

    const blogs = await Blog.find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate("author");

    const blogsCount = await Blog.find().countDocuments();

    res.json({
      blogs: blogs,
      paginationInfo: {
        totalItems: blogsCount,
        totalPages: Math.ceil(blogsCount / pageSize),
        pageSize,
        pageNumber,
      },
    });
  }
);

/**
 * @openapi
 * '/api/blogs':
 *  post:
 *     tags:
 *     - Blog
 *     summary: Create a blog
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateBlogInput'
 *     responses:
 *      201:
 *        description: Blog created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateBlogResponse'
 *      400:
 *        description: Bad request
 */
router.post(
  "/",
  [
    authz,
    validateReq(createBlogSchema, "body"),
    validateUniqueness("title", Blog),
  ],
  async (req: Request, res: Response) => {
    const blogInput = res.locals.data as ICreateBlog;
    const user = res.locals.user;

    const blog = new Blog({ ...blogInput, author: user._id });

    const createdBlog = await (await blog.save()).populate("author");

    res.status(201).json(createdBlog);
  }
);

/**
 * @openapi
 * '/api/blogs/{id}':
 *  put:
 *    tags:
 *    - Blog
 *    summary: Update a blog
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The blog ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateBlogInput'
 *    responses:
 *      200:
 *        description: Blog updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdateBlogResponse'
 *      400:
 *        description: Bad request
 *      404:
 *        description: Blog not found
 */
router.put(
  "/:id",
  [
    authz,
    validateObjectId,
    validateReq(updateBlogSchema, "body"),
    validateUniqueness("title", Blog),
  ],
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const blogInput = res.locals.data as IUpdateBlog;

    // Fetch it
    const blog = await Blog.findOne({ _id: id });

    // Validate its existence
    if (!blog) {
      return res.status(404).json({ message: "Blog doesn't exist" });
    }

    // Check the ownership
    const userId = res.locals.user._id;
    const ownerId = blog.author?.toString();
    if (userId !== ownerId)
      return res.status(403).send({ message: "Access denied." });

    // Set the changed fields
    blog.set(blogInput);

    // Save it to the DB
    const updatedBlog = await (await blog.save()).populate("author");

    res.json(updatedBlog);
  }
);

/**
 * @openapi
 * '/api/blogs/{id}':
 *  delete:
 *    tags:
 *    - Blog
 *    summary: Delete a blog by ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The blog ID to delete
 *    responses:
 *      200:
 *        description: The blog was successfully deleted
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized - User is not authenticated
 *      403:
 *        description: Forbidden - User is not authorized to delete blogs
 *      404:
 *        description: Not Found - The blog with the given ID was not found
 */
router.delete(
  "/:id",
  [authz, admin, validateObjectId],
  async (req: Request, res: Response) => {
    const id = req.params.id;

    // Fetch it
    const blog = await Blog.findOne({ _id: id });

    // Validate its existence
    if (!blog) {
      return res.status(404).json({ message: "Blog doesn't exist" });
    }

    await blog.deleteOne();

    res.json("🟢");
  }
);

export default router;
