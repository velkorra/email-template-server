import { Document, model, Schema } from "mongoose";

export interface ITag extends Document {
    name: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
    {
        name: { type: String, required: true, unique: true, index: true },
        color: { type: String, required: true },
    },
    { timestamps: true }
);

export const Tag = model<ITag>("Tag", TagSchema);
