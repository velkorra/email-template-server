import { configDotenv } from "dotenv";
configDotenv();
import { Express, urlencoded, json } from "express";
import express from "express";
import { initializeDatabase } from "./database/dbConfig";
import { attachControllers } from "@decorators/express";
import { UserController } from "./controllers/userController";
import { AuthController } from "./controllers/AuthController";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passportConfig";

const app: Express = express();

//idk it looks awful mb prettify somehow
const { origin: ORIGIN, host: HOST, port: PORT } = (() => {
    const origin = process.env.ORIGIN;
    const host = process.env.HOST;
    const port = process.env.PORT;
    if (!origin || !host || !port) {
        console.log("missing env variables");
        process.exit(1);
    }
    return { origin, host, port };
})();

app.use(cors({credentials: true, origin: ORIGIN, exposedHeaders: ["Authorization"],}));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
attachControllers(app, [UserController, AuthController]);
app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(
            `${req.method} ${req.path} ${res.statusCode} ${res.statusMessage}`
        );
    });
    next();
});
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`app is running on the ${HOST}:${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
