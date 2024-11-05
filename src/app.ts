import { configDotenv } from "dotenv";
configDotenv();
import {
    Express,
    urlencoded,
    json,
} from "express";
import express from "express";
import { initializeDatabase } from "./database/dbConfig";
import { attachControllers } from "@decorators/express";
import { UserController } from "./controllers/userController";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app: Express = express();
const PORT: Number = 5000;
app.use(cors());
app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
attachControllers(app, [UserController]);
app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${res.statusMessage}`);
    });
    next();
  });
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log("app is running on the " + "http://localhost:" + PORT);
        });
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
