import passport from 'passport';
import { AuthService } from "../services/authService";
import { Controller, Get, Next, Req, Res } from "@decorators/express";
import { Request, Response, NextFunction } from "express";
import { IUser } from '../models/User';

@Controller("/auth")
export class AuthController {

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

            res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
            res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

            res.setHeader("Authorization", "Bearer " + accessToken);
            res.send(`<script>
                window.opener.postMessage('success', '*');
                window.close();
              </script>`);
        })(req, res, next);
    }



}
