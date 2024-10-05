import {
    Request,
    Response,
    Express,
    NextFunction,
    urlencoded,
    json,
} from "express";
import express from "express";
import { initializeDatabase } from "./database/dbConfig";
import { attachControllers } from "@decorators/express";
import { UserController } from "./controllers/userController";
var cookieParser = require("cookie-parser");

const app: Express = express();
const PORT: Number = 5000;
const Root = "/";
app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
// app.use("/", router);
const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use(middleware);
attachControllers(app, [UserController]);
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
