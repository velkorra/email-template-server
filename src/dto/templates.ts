import { PaginationParams } from "./common";
import { TagDto } from "./tags";
export type TemplateStatus = "draft" | "active" | "archived" | "under_review";
export interface TemplateResponseDto {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  htmlContent: string;
  category: string;
  status: TemplateStatus;
  tags: TagDto[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  variables: string[];
  metadata: {
    author: string;
    lastEditor: string;
    version: number;
  };
  currentVersion: number;
  versions: TemplateVersionDto[];
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  htmlContent: string;
  category: string;
  tags: string[];
  projectId?: string;
  variables?: string[];
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {
  versionComment?: string;
}

export interface TemplateVersionDto {
  version: number;
  htmlContent: string;
  changelog: string;
  author: {
    userId: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  variablesSnapshot: string[];
}

export interface TemplateSearchParams extends PaginationParams {
  query?: string;
  projectId?: string;
  category?: string;
  tags?: string[];
  status?: TemplateStatus;
}
