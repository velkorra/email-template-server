import { Document, model, Schema } from "mongoose";
import * as argon2 from "argon2";

export interface IUser extends Document {
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // делаем пароль необязательным
});


UserSchema.pre<IUser>("save", async function (next) {
    // Если пароля нет, пропускаем хеширование
    if (!this.password || !this.isModified("password")) {
        return next();
    }

    try {
        const hash = await argon2.hash(this.password);
        this.password = hash;
        next();
    } catch (error) {
        next(error as any);
    }
});


UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) return false;
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        return false;
    }
};

export const User = model<IUser>("User", UserSchema);
