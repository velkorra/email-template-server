import { Project } from "../models/Project";
import { IProject } from "../models/Project";

export class ProjectService {
    async createProject(project: Omit<IProject, "_id">): Promise<IProject> {
        const newProject = new Project(project);
        await newProject.save();
        return newProject;
    }

    async getProjects(): Promise<IProject[]> {
        return Project.find().populate("letters");
    }
}
