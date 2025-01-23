import "dotenv/config";
import "express-async-errors";
import express, { Request, Response } from "express";
import { connect } from "mongoose";
import swaggerDocs from "./util/swagger";
import auth from "./routes/auth";
import blogs from "./routes/blogs";
import error from "./middleware/error";

const app = express();

// Middleware
app.use(express.json());

// DB
await connect(process.env.DB_URI as string).then(() =>
  console.log(`\nConected to MongoDB ${process.env.DB_URI as string}`)
);

// Routes
app.get("/", (req: Request, res: Response) => res.json(`🟢🟢🟢`));
app.use("/api/auth", auth);
app.use("/api/blogs", blogs);
app.use(error);

// Publishing
const port = +(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(
    `\nApp is up and running at ${port} 🚀 \nhttp://localhost:${port}`
  );

  swaggerDocs(app, port);
});
