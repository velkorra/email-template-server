import { JwtPayload } from "jsonwebtoken";

export default interface UserJwtPayload extends JwtPayload {
    email: string;
}