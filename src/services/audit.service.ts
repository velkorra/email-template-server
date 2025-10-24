import { AuditLogDto } from "../dto/audit";
import { ListResponseDto } from "../dto/common";
import { AuditLog } from "../models/AuditLog";

export class AuditService {
  async logAction(
    action: string,
    entityType: "project" | "template" | "user",
    entityId: string,
    userId: string,
    details?: Record<string, unknown> | undefined
  ): Promise<AuditLogDto> {
    const logEntry = new AuditLog({
      action,
      entityType,
      entityId,
      user: userId,
      details
    });

    await logEntry.save();
    
    return {
      id: logEntry._id as string,
      action,
      entityType,
      entityId,
      userId,
      timestamp: logEntry.timestamp.toISOString(),
      details
    };
  }

  async getProjectAuditLogs(
    projectId: string,
    pagination: { page: number, limit: number }
  ): Promise<ListResponseDto<AuditLogDto>> {
    const [logs, total] = await Promise.all([
      AuditLog.find({ entityId: projectId })
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .populate('user')
        .lean(),
      AuditLog.countDocuments({ entityId: projectId })
    ]);

    return {
      data: logs.map(log => ({
        id: log._id.toString(),
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId.toString(),
        userId: log.user.toString(),
        timestamp: log.timestamp.toISOString(),
        details: log.details
      })),
      total,
      page: pagination.page,
      limit: pagination.limit
    };
  }
}