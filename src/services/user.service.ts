import { mongo } from "mongoose";
import { CreateUserDto } from "../dto/dto";
import { UserProfileDto } from "../dto/users";
import { IUser, User } from "../models/User";

export class UserService {
    async createUser(userData: CreateUserDto): Promise<IUser> {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const user = new User({
            email: userData.email,
            password: userData.password,
        });

        return user.save();
    }

    async getProfile(userId: string): Promise<UserProfileDto> {
        const user = await User.findById(userId)
            .populate("starredProjects")
            .lean();

        if (!user) throw new Error("User not found");

        return {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            notificationSettings: user.notificationSettings,
            starredProjects: user.starredProjects.map((p) => p.toString()),
            recentTemplates: user.recentTemplates.map((t) => t.toString()),
        };
    }

    async updateProfile(
        userId: string,
        data: UserProfileDto
    ): Promise<UserProfileDto> {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true }
        ).lean();

        if (!user) throw new Error("User not found");

        return this.getProfile(userId);
    }

    async toggleProjectStar(
        userId: string,
        projectId: string
    ): Promise<string[]> {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const index = user.starredProjects.indexOf(projectId as any);
        if (index === -1) {
            user.starredProjects.push(projectId as any);
        } else {
            user.starredProjects.splice(index, 1);
        }

        await user.save();
        return user.starredProjects.map((p) => p.toString());
    }
}
