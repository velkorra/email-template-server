import { Schema, model, Document } from "mongoose";

export interface ILetter extends Document {
    title: string;
    text: string;
    project: string;
}

const letterSchema = new Schema<ILetter>({
    title: { type: String, required: true },
    text: { type: String, required: true },
    project: { type: String, required: true }, 
});

export const Letter = model<ILetter>("Letter", letterSchema);
