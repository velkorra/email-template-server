// models/User.model.ts
import { Document, model, Schema } from "mongoose";
import * as argon2 from "argon2";

export interface IUser extends Document {
    email: string;
    password?: string;
    fullName: string;
    avatar?: string;
    role: "user" | "admin";
    starredProjects: Schema.Types.ObjectId[];
    recentTemplates: Schema.Types.ObjectId[];
    notificationSettings: {
        email: boolean;
        push: boolean;
        frequency: "instant" | "daily" | "weekly";
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    fullName: { type: String, required: false },
    avatar: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    starredProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    recentTemplates: [{ type: Schema.Types.ObjectId, ref: "Template" }],
    notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        frequency: {
            type: String,
            enum: ["instant", "daily", "weekly"],
            default: "daily",
        },
    },
});

UserSchema.pre<IUser>("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();

    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (error) {
        next(error as Error);
    }
});

UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return this.password
        ? await argon2.verify(this.password, candidatePassword)
        : false;
};

export const User = model<IUser>("User", UserSchema);
