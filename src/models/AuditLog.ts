import { Document, model, Schema } from "mongoose";

export interface IAuditLog extends Document {
    action: string;
    entityType: "project" | "template" | "user";
    entityId: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    details: Record<string, unknown>;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    action: { type: String, required: true },
    entityType: {
        type: String,
        enum: ["project", "template", "user"],
        required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    details: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
