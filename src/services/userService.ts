import { UserDto } from "../dto/dto";
import { UserExistsError } from "../errors/UserExistsError";
import { User } from "../models/User";
import { AuthService } from "./authService";

export class UserService {
    async createUser(user: UserDto) {
        try {
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                throw new UserExistsError();
            }
            const newUser = new User(user);
            await newUser.save();
        } catch (error) {
            throw error;
        }
    }

    async findOrCreateUser(email: string) {
        let user = await User.findOne({ email });
        if (!user) {
            // Создаем пользователя без пароля для Google-авторизации
            user = new User({ email });
            await user.save();

            // Создаем сессию с refresh token для нового пользователя
            const { tokenId, token } = await AuthService.createNewSession(user);
            console.log("Создан новый refresh token для Google пользователя:", { tokenId, token });
        }
        return user;
    }




    async findUserById(id: string) {
        return User.findById(id);
    }
}
