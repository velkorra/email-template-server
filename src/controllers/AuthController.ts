import passport from 'passport';
import { AuthService } from "../services/authService";
import { Controller, Get, Next, Post, Req, Res } from "@decorators/express";
import { Request, Response, NextFunction } from "express";
import { IUser } from '../models/User';
import { LoginError } from '../errors/LoginError';

@Controller("/auth")
export class AuthController {
    authService = new AuthService();

    @Get("/google")
    googleAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
        return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }

    @Get("/google/callback")
    googleAuthCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
        passport.authenticate("google", { failureRedirect: "/" }, async (err: any, user: IUser) => {
            if (err || !user) {
                console.error("Authentication error:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const accessToken = AuthService.generateAccessToken(user);

            const { tokenId, token } = await AuthService.createNewSession(user);
            const refreshToken = `${tokenId}.${token}`;

            res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

            res.setHeader("Authorization", "Bearer " + accessToken);
            res.send(`<script>
                window.opener.postMessage('success', '*');
                window.close();
              </script>`);
        })(req, res, next);
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

    @Post("/logout")
    async logout(@Req() req: Request, @Res() res: Response) {
        try {
            res.clearCookie("refreshToken");
            res.status(200).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

}
