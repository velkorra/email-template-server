import { IUser } from "../models/User";

export type UserDto = Pick<IUser, "email" | "password">