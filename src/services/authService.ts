import { UserDto } from "../dto/dto";
import { LoginError } from "../errors/LoginError";
import { IUser, User } from "../models/User";
import jwt, { Secret } from "jsonwebtoken";
import UserJwtPayload from "../types/UserJwtPayload";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { IRefreshToken, RefreshToken } from "../models/RefreshToken";

const _JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!_JWT_ACCESS_SECRET) {
    throw new MissingEnvVariableError("JWT_ACCESS_SECRET");
}

const JWT_ACCESS_SECRET = _JWT_ACCESS_SECRET as Secret;

export class AuthService {
    async login(userDto: UserDto) {
        const email = userDto.email;
        const password = userDto.password;

        const user = await User.findOne({ email });
        if (!user) {
            throw new LoginError();
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new LoginError();
        }
        const accessToken = AuthService.generateAccessToken(user);
        const refreshToken = await this.createNewSession(user);
        return { accessToken, refreshToken };
    }

    verifyLogin(token: string | undefined) {
        if (!token) {
            throw new UnauthorizedError("No token provided");
        }
        try {
            const payload = AuthService.verifyToken(token) as UserJwtPayload;
            return payload.email;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError("Token expired");
            }
            throw error;
        }
    }

    private static generateAccessToken(user: UserDto) {
        return jwt.sign({ email: user.email }, JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });
    }

    static verifyToken(token: string) {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    }

    async createNewSession(user: IUser) {
        const token = await AuthService.generateRefreshToken(user);
        const refreshToken = new RefreshToken({
            userId: user._id,
            token,
            expires: new Date(Date.now() + 60 * 1000),
        });
        await refreshToken.save();
        return token;
    }

    async getSessionUser(token: string) {
        const refreshTokens: IRefreshToken[] = await RefreshToken.find()
            .populate("userId")
            .exec();

        for (const refreshToken of refreshTokens) {
            const isValid = await AuthService.verifyRefreshToken(
                token,
                refreshToken.token
            );
            if (isValid && refreshToken.userId) {
                return refreshToken.userId as IUser;
            }
        }
        throw new UnauthorizedError("Invalid token");
    }
    private static async generateRefreshToken(user: IUser) {
        const token = randomBytes(64).toString("hex");
        const hahsedToken = await argon2.hash(token);
        return hahsedToken;
    }

    private static async verifyRefreshToken(
        token: string,
        hashedToken: string
    ) {
        return await argon2.verify(token, hashedToken);
    }
}
