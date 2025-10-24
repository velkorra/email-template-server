import { Document, model, Schema } from "mongoose";

interface ProjectStats {
    templateCount: number;
    sentEmails: number;
    openRate: number;
    clickRate: number;
    lastActivity: Date;
}

interface ProjectSettings {
    senderEmail: string;
    senderName: string;
    trackOpens: boolean;
    trackClicks: boolean;
}

export interface IProject extends Document {
    name: string;
    description: string;
    industry: string;
    status: "active" | "archived" | "draft";
    thumbnailColor: string;
    stats: ProjectStats;
    members: Array<{
        user: Schema.Types.ObjectId;
        role: "admin" | "editor" | "viewer";
        joinedAt: Date;
    }>;
    templates: Schema.Types.ObjectId[];
    settings: ProjectSettings;
    createdAt: Date;
    updatedAt: Date;
    isStarred: boolean;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true, index: true },
        description: String,
        industry: { type: String, required: true },
        status: {
            type: String,
            enum: ["active", "archived", "draft"],
            default: "draft",
        },
        thumbnailColor: { type: String, default: "#1976d2" },
        stats: {
            templateCount: { type: Number, default: 0 },
            sentEmails: { type: Number, default: 0 },
            openRate: { type: Number, default: 0 },
            clickRate: { type: Number, default: 0 },
            lastActivity: Date,
        },
        members: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                role: {
                    type: String,
                    enum: ["admin", "editor", "viewer"],
                    default: "viewer",
                },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
        templates: [{ type: Schema.Types.ObjectId, ref: "Template" }],
        settings: {
            senderEmail: { type: String, required: true },
            senderName: { type: String, required: true },
            trackOpens: { type: Boolean, default: true },
            trackClicks: { type: Boolean, default: true },
        },
        isStarred: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Project = model<IProject>("Project", ProjectSchema);
