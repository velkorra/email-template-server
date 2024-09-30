import { Router } from "express";
import { login } from "../controllers/authController";
import { account, register } from "../controllers/userController";
import { authenticateToken } from "../middleware/Middleware";

const userRoutes = Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.get("/account", authenticateToken, account);
export default userRoutes;
