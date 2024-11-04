import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserService } from '../services/userService';
import { IUser } from '../models/User';

const userService = new UserService();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"],
}, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: IUser | null) => void) => {
    try {
        const user = await userService.findOrCreateUser(profile.emails![0].value);
        done(null, user);
    } catch (error) {
        done(error);
    }
}));
