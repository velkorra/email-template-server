import { Schema, Types, model } from "mongoose";
import { IUser } from "./User";

export interface IRefreshToken extends Document {
    userId: Types.ObjectId | IUser;
    tokenId: string;
    token: string;
    expires: Date;
    createdAt: Date;
    createdByIp?: string;
    revokedAt?: Date;
    revokedByIp?: string;
    replacedByToken?: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenId: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    createdByIp: { type: String },
    revokedAt: { type: Date },
    revokedByIp: { type: String },
    replacedByToken: { type: String },
});

export const RefreshToken = model<IRefreshToken>(
    "RefreshToken",
    RefreshTokenSchema
);
