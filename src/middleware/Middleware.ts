import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService";
import { UnauthorizedError } from "../errors/UnauthorizedError";

const authService = new AuthService();

export const authenticateToken = async (req: Request , res: Response, next: NextFunction) => {
    try {
        const email = authService.verifyLogin(
            req.headers.authorization?.replace("Bearer ", "")
        ) as string;
        req.user = {email};
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            res.status(401).send({ message: "Authorization failed" });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}