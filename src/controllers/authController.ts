import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthService } from "../services/authService";
import { LoginError } from "../errors/LoginError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const {accessToken, refreshToken} = await authService.login(req.body);
        res.cookie("refreshToken", refreshToken, {secure: true, httpOnly: true});
        res.status(200).json({
            message: "Login successful",
            accessToken: accessToken,
        });
    } catch (error) {
        if (error instanceof LoginError) {
            res.status(401).send(error.message);
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


