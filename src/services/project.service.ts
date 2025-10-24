// services/project.service.ts

import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from "../dto/projects";
import { ProjectListResponseDto } from "../dto/response";
import { TemplateResponseDto } from "../dto/templates";
import { IProject, Project } from "../models/Project";
import { Template } from "../models/Template";
import { User } from "../models/User";

export class ProjectService {
  async createProject(userId: string, data: CreateProjectDto): Promise<ProjectResponseDto> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const project = new Project({
      ...data,
      members: [{
        user: userId,
        role: 'admin'
      }],
      settings: {
        senderEmail: `${data.name.toLowerCase().replace(/\s/g, '-')}@company.com`,
        senderName: data.name,
        trackOpens: true,
        trackClicks: true
      }
    });

    await project.save();
    return this.mapToDto(project);
  }

  async getProjects(
    userId: string, 
    filters: { status?: string, search?: string },
    pagination: { page: number, limit: number }
  ): Promise<ProjectListResponseDto> {
    const query = {
      'members.user': userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { 
        $text: { $search: filters.search } 
      })
    };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .populate('members.user')
        .lean(),
      Project.countDocuments(query)
    ]);

    return {
      data: await Promise.all(projects.map(async d => this.mapToDto(d))),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async updateProject(
    userId: string,
    projectId: string,
    data: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, 'members.user': userId, 'members.role': 'admin' },
      { $set: data },
      { new: true }
    ).lean();

    if (!project) throw new Error('Project not found or access denied');
    return await this.mapToDto(project);
  }

  private async mapToDto(project: IProject): Promise<ProjectResponseDto> {
    return {
      id: project._id as string,
      name: project.name,
      description: project.description,
      industry: project.industry,
      status: project.status,
      thumbnailColor: project.thumbnailColor,
      stats: {
        clickRate: project.stats.clickRate,
        lastActivity: project.stats.lastActivity.toString(),
        openRate: project.stats.openRate,
        sentEmails: project.stats.sentEmails,
        templateCount: project.templates.length
      },
      members: project.members.map(m => ({
        userId: m.user.toString(),
        role: m.role,
        joinedAt: m.joinedAt.toISOString()
      })),
      templates: await Promise.all(project.templates.map(async t => await Template.findById(t))) as TemplateResponseDto[],
      settings: project.settings,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      isStarred: project.isStarred
    };
  }
}