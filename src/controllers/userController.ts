import { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    Status,
} from "@decorators/express";
import { UserExistsError } from "../errors/UserExistsError";
import { RequireAuth } from "../middleware/Middleware";
import { AuthService } from "../services/authService";
import { LoginError } from "../errors/LoginError";
import { UserDto } from "../dto/dto";

@Controller("/users")
export class UserController {
    authService = new AuthService();
    userService = new UserService();

    @Post("/register")
    async register(@Body() user: UserDto, @Res() res: Response) {
        try {
            await this.userService.createUser(user);
            res.status(201).send();
        } catch (error) {
            if (error instanceof UserExistsError) {
                res.status(400).send(error.message);
                return;
            }
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    @RequireAuth()
    @Get("/account")
    async account(@Req() req: Request, @Res() res: Response) {
        const response = { email: req.user?.email };
        res.status(200).json(response);
    }

    @Post("/login")
    async login(@Req() req: Request, @Res() res: Response) {
        try {
            const { accessToken, refreshToken } = await this.authService.login(
                req.body
            );
            res.cookie("refreshToken", refreshToken, {
                secure: true,
                httpOnly: true,
            });
            res.setHeader("Authorization", "Bearer " + accessToken);
            res.status(200).send();
        } catch (error) {
            if (error instanceof LoginError) {
                res.status(401).send(error.message);
                return;
            }
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
