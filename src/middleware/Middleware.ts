import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { attachMiddleware } from "@decorators/express";

const authService = new AuthService();
export function RequireAuth(roles: string[] = []) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        attachMiddleware(
            target,
            key,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const authHeader = req.headers.authorization;
                    const accessToken = authHeader ? authHeader.replace("Bearer ", "") : req.cookies.accessToken;

                    const { email, newAccessToken } = await authService.verifyLogin(accessToken, req.cookies.refreshToken);

                    req.user = { email };
                    if (newAccessToken) {
                        res.setHeader("Authorization", "Bearer " + newAccessToken);
                    }

                    next();
                } catch (error) {
                    if (error instanceof UnauthorizedError) {
                        return res.status(401).json({ message: "Authorization failed" });
                    }
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            }
        );
    };
}

