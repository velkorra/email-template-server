import { connect } from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();

const mongoUri: unknown = process.env.MONGO_URI;

export const initializeDatabase = async () => {
    if (typeof mongoUri === "string") {
        try {
            await connect(mongoUri);
            console.log("MongoDB connection successful");
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    } else {
        throw new MissingEnvVariableError("MONGO_URI");
    }
};


