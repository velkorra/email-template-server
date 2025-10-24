// services/template.service.ts

import { TagDto } from "../dto/tags";
import {
    CreateTemplateDto,
    TemplateResponseDto,
    UpdateTemplateDto,
} from "../dto/templates";
import { Project } from "../models/Project";
import { Tag } from "../models/Tag";
import { ITemplate, Template } from "../models/Template";
import { User } from "../models/User";

export class TemplateService {
    async createTemplate(
        userId: string,
        projectId: string,
        data: CreateTemplateDto
    ): Promise<TemplateResponseDto> {
        const [user, project] = await Promise.all([
            User.findById(userId),
            Project.findById(projectId),
        ]);

        if (!user || !project) throw new Error("User or project not found");

        const template = new Template({
            ...data,
            project: projectId,
            metadata: {
                author: userId,
                lastEditor: userId,
                version: 1,
            },
            versions: [
                {
                    version: 1,
                    htmlContent: data.htmlContent,
                    changelog: "Initial version",
                    author: userId,
                    variablesSnapshot: data.variables || [],
                },
            ],
        });

        await template.save();

        // Обновляем статистику проекта
        await Project.findByIdAndUpdate(projectId, {
            $inc: { "stats.templateCount": 1 },
            $set: { "stats.lastActivity": new Date() },
        });

        return await this.mapToDto(template);
    }

    async updateTemplate(
        userId: string,
        templateId: string,
        data: UpdateTemplateDto
    ): Promise<TemplateResponseDto> {
        const template = await Template.findById(templateId);
        if (!template) throw new Error("Template not found");

        const updatedTemplate = await Template.findOneAndUpdate(
            { _id: templateId },
            {
                $set: {
                    ...data, // обновляет переданные значения
                },
                $push: {
                    versions: {
                        version: data.versionComment
                            ? template.currentVersion + 1
                            : template.currentVersion,
                        htmlContent: data.htmlContent || template.htmlContent,
                        changelog:
                            data.versionComment || "No changelog provided",
                        author: userId,
                        variablesSnapshot: data.variables || template.variables,
                    },
                },
                $inc: { currentVersion: data.versionComment ? 1 : 0 },
            },
            { new: true }
        );

        if (!template) throw new Error("Template not found");
        return await this.mapToDto(template);
    }

    private async mapToDto(template: ITemplate): Promise<TemplateResponseDto> {
        return {
            id: template._id as string,
            name: template.name,
            description: template.description,
            htmlContent: template.htmlContent,
            category: template.category,
            tags: (await Promise.all(
                template.tags.map(async (t) => Tag.findById(t))
            )) as TagDto[],
            status: template.status,
            usageCount: template.usageCount,
            versions: await Promise.all(
                template.versions.map(async (v) => ({
                    version: v.version,
                    htmlContent: v.htmlContent,
                    changelog: v.changelog,
                    author: await (async () => {
                        const user = await User.findById(v.author.toString());
                        return {
                            userId: user!._id as string,
                            name: user!.fullName,
                            avatar: user!.avatar,
                        };
                    })(),
                    variablesSnapshot: v.variablesSnapshot,
                    createdAt: v.createdAt.toISOString(),
                }))
            ),
            projectId: template.project?.toString(),
            variables: template.variables,
            metadata: {
                author: template.metadata.author.toString(),
                lastEditor: template.metadata.lastEditor?.toString(),
                version: template.metadata.version,
            },
            isFavorite: false,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
            currentVersion: template.currentVersion,
            previewImage: template.imagePreview,
        };
    }
}
