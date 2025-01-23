import { z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     paginationInput:
 *      pageNumber:
 *        type: number
 *        minimum: 1
 *        maximum: 99999
 *      pageSize:
 *        type: number
 *        minimum: 1
 *        maximum: 100
 *     paginationResponse:
 *         type: object
 *         properties:
 *           totalItems:
 *             type: integer
 *           totalPages:
 *             type: integer
 *           pageSize:
 *             type: integer
 *           pageNumber:
 *             type: integer
 */
const paginationSchema = z
  .object({
    pageNumber: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 99999, {
        message: "Invalid page number",
      }),
    pageSize: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: "Invalid page size",
      }),
  })
  .partial();

export default paginationSchema;

export type IPaginationInput = z.infer<typeof paginationSchema>;
