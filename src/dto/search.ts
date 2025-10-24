import { ProjectResponseDto } from "./projects";
import { TemplateResponseDto } from "./templates";
import { UserDto } from "./users";

export interface GlobalSearchResultDto {
  projects: ProjectResponseDto[];
  templates: TemplateResponseDto[];
  users: UserDto[];
}
