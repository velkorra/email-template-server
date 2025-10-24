import { Document, model, Schema } from "mongoose";

interface TemplateVersion {
    version: number;
    htmlContent: string;
    changelog: string;
    author: Schema.Types.ObjectId;
    variablesSnapshot: string[];
    createdAt: Date;

}

export interface ITemplate extends Document {
    name: string;
    description: string;
    htmlContent: string;
    category: string;
    tags: Schema.Types.ObjectId[];
    status: "draft" | "active" | "archived" | "under_review";
    usageCount: number;
    versions: TemplateVersion[];
    currentVersion: number;
    project?: Schema.Types.ObjectId;
    variables: string[];
    metadata: {
        author: Schema.Types.ObjectId;
        lastEditor: Schema.Types.ObjectId;
        version: number;
    };
    createdAt: Date;
    updatedAt: Date;
    imagePreview: string;
}

const TemplateSchema = new Schema<ITemplate>(
    {
        name: { type: String, required: true, index: true },
        description: String,
        htmlContent: { type: String, required: true },
        category: String,
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        status: {
            type: String,
            enum: ["draft", "active", "archived", "under_review"],
            default: "draft",
        },
        usageCount: { type: Number, default: 0 },
        versions: [
            {
                version: Number,
                htmlContent: String,
                changelog: String,
                author: { type: Schema.Types.ObjectId, ref: "User" },
                variablesSnapshot: [String],
                createdAt: { type: Date, default: Date.now },
            },
        ],
        currentVersion: { type: Number, default: 1 },
        project: { type: Schema.Types.ObjectId, ref: "Project" },
        variables: [String],
        metadata: {
            author: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            lastEditor: { type: Schema.Types.ObjectId, ref: "User" },
            version: { type: Number, default: 1 },
        },
        imagePreview: { type: String, required: false },
    },
    { timestamps: true }
);

export const Template = model<ITemplate>("Template", TemplateSchema);
