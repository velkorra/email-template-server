import { IUser, User } from "../models/User";
import { IRefreshToken, RefreshToken } from "../models/RefreshToken";
import { LoginError } from "../errors/LoginError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { RefreshTokenExpiredError } from "../errors/RefreshTokenExpiredError";
import UserJwtPayload from "../types/UserJwtPayload";
import jwt, { Secret } from "jsonwebtoken";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { MissingEnvVariableError } from "../errors/MissingEnvVariableError";
import { UserDto } from "../dto/dto";
import { Types } from "mongoose";



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

        // Если пользователь был создан через Google (без пароля), выдаем ошибку
        if (!user.password) {
            throw new LoginError();
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new LoginError();
        }

        const accessToken = AuthService.generateAccessToken(user);
        const { tokenId, token } = await AuthService.createNewSession(user);

        const refreshToken = tokenId + "." + token;
        return { accessToken, refreshToken };
    }


    async verifyLogin(
        accessToken: string | undefined,
        refreshToken: string | undefined
    ): Promise<{ email: string; newAccessToken?: string | null }> {
        try {
            if (accessToken) {
                const payload = AuthService.verifyToken(accessToken) as UserJwtPayload;
                return { email: payload.email };
            }
            throw new Error();
        } catch (error) {
            if (refreshToken) {
                const [tokenId, tokenValue] = refreshToken.split(".");
                try {
                    const user = await this.verifyByRefresh(tokenId, tokenValue);
                    const newAccessToken = AuthService.generateAccessToken(user);
                    return { email: user.email, newAccessToken };
                } catch (error) {
                    if (error instanceof RefreshTokenExpiredError) {
                        throw new UnauthorizedError("Token expired");
                    }
                    throw error;
                }
            } else throw new UnauthorizedError("No token provided");
        }
    }

    // static generateAccessToken(user: IUser) {
    //     return jwt.sign({ email: user.email }, JWT_ACCESS_SECRET, {
    //         expiresIn: "15m",
    //     });
    // }
    static generateAccessToken(user: IUser) {
        return jwt.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET!, {
            expiresIn: '15m' });
    }

    static verifyToken(token: string) {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    }

    static async createNewSession(user: IUser) {
        const existingToken = await RefreshToken.findOne({
            userId: user._id
        });

        if (existingToken) {
            if (existingToken.expires > new Date()) {
                return { tokenId: existingToken.tokenId, token: existingToken.token };
            }

            await existingToken.deleteOne();
        }

        const { token, hashedToken } = await AuthService.generateRefreshToken(user);
        const tokenId = uuidv4();

        const refreshToken = new RefreshToken({
            userId: user._id,
            token: hashedToken,
            tokenId: tokenId,
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 час
        });
        await refreshToken.save();

        return { tokenId, token };
    }






    async verifyByRefresh(tokenId: string, tokenValue: string) {
        const refreshToken = await RefreshToken.findOne({ tokenId })
            .populate("userId")
            .exec();
        if (!refreshToken) {
            throw new UnauthorizedError("Invalid tokenId");
        }

        if (new Date() > refreshToken.expires) {
            throw new RefreshTokenExpiredError("Refresh Token Expired");
        }

        const isValid = await AuthService.verifyRefreshToken(tokenValue, refreshToken.token);
        if (isValid && refreshToken.userId) {
            return refreshToken.userId as IUser;
        }

        throw new UnauthorizedError("Invalid token");
    }


    private async cleanUpExpiredTokens(userId: Types.ObjectId) {
        const now = new Date();
        await RefreshToken.deleteMany({
            userId,
            expires: { $lt: now }
        });
    }

    private static async generateRefreshToken(user: IUser) {
        const token = randomBytes(64).toString("hex");
        const hashedToken = await argon2.hash(token);
        return { token, hashedToken };
    }

    private static async verifyRefreshToken(token: string, hashedToken: string) {
        return await argon2.verify(hashedToken, token);
    }
}
