import { UserDto } from "../dto/dto";
import { UserExistsError } from "../errors/UserExistsError";
import { User } from "../models/User";

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
}
