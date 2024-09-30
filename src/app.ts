import { Request, Response, Express, NextFunction, urlencoded, json } from "express";
import express from "express";
import { initializeDatabase } from "./database/dbConfig";
import router from "./routes";

const app: Express = express();
const PORT: Number = 5000;
const Root = "/";
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/", router);

const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.get(Root, (req: Request, res: Response) => {
    res.send("hello world");
});


app.post(Root, (req: Request, res: Response) => {
    res.send(req.body);
});

app.use(middleware);
initializeDatabase()
.then(() => {
    app.listen(PORT, () => {
        console.log("port is running on the " + PORT);
    });
})
.catch((error) => {
    console.log(error);
    process.exit(1);
});
