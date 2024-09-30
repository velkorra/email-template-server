import { Request, Response } from "express";
import { UserService } from "../services/userService";

export const register = async (req: Request, res: Response) => {
    const userService = new UserService();
    try {
        await userService.createUser(req.body);
        res.status(201).send();
    } catch (error) {
        if (error instanceof UserExistsError) {
            res.status(400).send(error.message);
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const account = async (req: Request, res: Response) => {
    const ip = req.headers.forwarded
    const response = {email: req.user?.email, ip}
    res.status(200).json(response);
};
