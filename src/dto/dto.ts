import { IUser } from "../models/User";

export type CreateUserDto = Pick<IUser, "email" | "password">