import { UserDto } from "../dto/dto";
import { LoginError } from "../errors/LoginError";
import { IUser, User } from "../models/User";
import jwt, { Secret } from "jsonwebtoken";
import UserJwtPayload from "../types/UserJwtPayload";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { IRefreshToken, RefreshToken } from "../models/RefreshToken";
import { RefreshTokenExpiredError } from "../errors/RefreshTokenExpiredError";
import { v4 as uuidv4 } from "uuid";
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
        const { tokenId, token } = await this.createNewSession(user);
        const refreshToken = tokenId + "." + token;
        return { accessToken, refreshToken };
    }

    async verifyLogin(
        accessToken: string | undefined,
        refreshToken: string | undefined
    ): Promise<{ email: string; newAccessToken?: string | null }> {
        try {
            if (accessToken) {
                const payload = AuthService.verifyToken(
                    accessToken
                ) as UserJwtPayload;
                return { email: payload.email };
            }
            throw new Error();
        } catch (error) {
            if (refreshToken) {
                const [tokenId, tokenValue] = refreshToken.split(".");
                try {
                    const user = await this.verifyByRefresh(
                        tokenId,
                        tokenValue
                    );
                    const newAccessToken =
                        AuthService.generateAccessToken(user);
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

    private static generateAccessToken(user: UserDto | IUser) {
        return jwt.sign({ email: user.email }, JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });
    }

    static verifyToken(token: string) {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    }

    async createNewSession(user: IUser) {
        const { token, hahsedToken } = await AuthService.generateRefreshToken(
            user
        );
        const tokenId = uuidv4();
        const refreshToken = new RefreshToken({
            userId: user._id,
            token: hahsedToken,
            tokenId: tokenId,
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 Hour, in future change to 7 or more days
        });
        await refreshToken.save();
        return { tokenId, token };
    }

    async verifyByRefresh(tokenId: string, tokenValue: string) {
        const refreshToken = await RefreshToken.findOne({ tokenId })
            .populate("userId")
            .exec();
        if (!refreshToken) {
            throw new UnauthorizedError("Invalid tokeId");
        }
        const isValid = await AuthService.verifyRefreshToken(
            tokenValue,
            refreshToken.token
        );
        if (isValid && refreshToken.userId) {
            if (new Date().getTime() < refreshToken.expires.getTime()) {
                return refreshToken.userId as IUser;
            }
            throw new RefreshTokenExpiredError("Refresh Token Expired");
        }

        throw new UnauthorizedError("Invalid token");
    }
    private static async generateRefreshToken(user: IUser) {
        const token = randomBytes(64).toString("hex");
        const hahsedToken = await argon2.hash(token);
        return { token, hahsedToken };
    }

    private static async verifyRefreshToken(
        token: string,
        hashedToken: string
    ) {
        return await argon2.verify(hashedToken, token);
    }
}
