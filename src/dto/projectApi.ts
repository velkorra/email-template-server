export interface AddMemberRequestDto {
  projectId: string;
  userId: string;
  role: "admin" | "editor" | "viewer";
}

export interface RemoveMemberRequestDto {
  projectId: string;
  userId: string;
}

export interface ToggleFavoriteRequestDto {
  projectId: string;
}

export interface CloneTemplateRequestDto {
  templateId: string;
  newName: string;
  projectId?: string;
}

export interface ExportTemplatesRequestDto {
  templateIds: string[];
  format: "html" | "json" | "zip";
}
