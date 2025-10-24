import { TemplateResponseDto } from "./templates";

export interface ProjectStatsDto {
  templateCount: number;
  sentEmails: number;
  openRate: number;
  clickRate: number;
  lastActivity: string;
}

export type ProjectStatus = "active" | "archived" | "draft";
export type ProjectRole = "admin" | "editor" | "viewer";
export interface ProjectMemberDto {
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  industry: string;
  status: ProjectStatus;
  thumbnailColor: string;
  stats: ProjectStatsDto;
  members: ProjectMemberDto[];
  templates: TemplateResponseDto[];
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
  settings: {
    senderEmail: string;
    senderName: string;
    trackOpens: boolean;
    trackClicks: boolean;
  };
}

export interface CreateProjectDto {
  name: string;
  description: string;
  industry: string;
  initialTemplates?: string[];
  members?: Array<{
    userId: string;
    role: ProjectRole;
  }>;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  industry?: string;
  status?: ProjectStatus;
  settings?: {
    senderEmail?: string;
    senderName?: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
  };
}
