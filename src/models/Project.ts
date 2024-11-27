import { Schema, model, Document } from "mongoose";
import { ILetter } from "./Letter"; 

export interface IProject extends Document {
    name: string;
    description: string;
    date: Date;
    letters: ILetter[]; 
}

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    letters: [{ type: Schema.Types.ObjectId, ref: "Letter" }],
});

export const Project = model<IProject>("Project", ProjectSchema);
