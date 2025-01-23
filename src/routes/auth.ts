import express, { Request, Response } from "express";
import User, {
  createUserSchema,
  IUserCred,
  userCredSchema,
} from "../models/user";
import validateUniqueness from "../middleware/validateUniqueness";
import validateReq from "../middleware/validateReq";
export const router = express.Router();
import * as bcrypt from "bcrypt";
import { ICreateUser } from "../models/user";
import jwt from "jsonwebtoken";

/**
 * @openapi
 * '/api/auth/signup':
 *  post:
 *     tags:
 *     - User
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserResponse'
 *      400:
 *        description: Bad request
 */
router.post(
  "/signup",
  [validateReq(createUserSchema, "body"), validateUniqueness("email", User)],
  async (req: Request, res: Response) => {
    // Extracting the user
    const userInput = res.locals.data as ICreateUser;

    // Hashing the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);
    userInput.password = hashedPassword;

    // Creating the user
    const user = new User(userInput);
    const createdUser = await user.save();

    // Removing the password
    const { password, ...userWithoutPass } = createdUser.toObject();

    // Generating a token
    const token = jwt.sign(
      userWithoutPass,
      process.env.JWT_PRIVATE_KEY as string
    );

    // Sending the result
    res.header("x-auth-token", token).status(201).json(userWithoutPass);
    // In a real-world scenario I'd implement it with a "refresh token" and an expiration date for the "access token"
  }
);

/**
 * @openapi
 * '/api/auth/signin':
 *  post:
 *     tags:
 *     - User
 *     summary: User login
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UserCredentialsInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      400:
 *        description: Incorrect Email or Password
 */
router.post(
  "/signin",
  [validateReq(userCredSchema, "body")],
  async (req: Request, res: Response) => {
    // Extracting the credentials
    const userCred = res.locals.data as IUserCred;

    // Trying to fetch the user
    const user = await User.findOne({ email: userCred.email }).select(
      "+password"
    );

    // Checking the existance of the email
    if (!user) {
      res.status(400).json({
        message: "Incorrect Email or Password",
      });
      return;
    }

    // Checking the validity of the password
    const isValidePassword = await bcrypt.compare(
      userCred.password || "",
      user.password
    );
    if (!isValidePassword) {
      res.status(400).json({
        message: "Incorrect Email or Password",
      });
      return;
    }

    // Removing the password
    const { password, ...userWithoutPass } = user.toObject();

    // Generating a token
    const token = jwt.sign(
      userWithoutPass,
      process.env.JWT_PRIVATE_KEY as string
    );

    // Sending the result
    res.header("x-auth-token", token).send("🟢");
    // In a real-world scenario I'd implement it with a "refresh token" and an expiration date for the "access token"
  }
);

export default router;
