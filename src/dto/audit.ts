export interface AuditLogDto {
  id: string;
  action: string;
  entityType: "project" | "template" | "user";
  entityId: string;
  userId: string;
  timestamp: string;
  details: Record<string, unknown> | undefined;
}
