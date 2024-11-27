import { Controller, Post, Get, Body, Req, Res } from "@decorators/express";
import { Request, Response } from "express";
import { ProjectService } from "../services/ProjectService";
import { IProject } from "../models/Project";
import { RequireAuth } from "../middleware/Middleware";

@Controller("/projects")
export class ProjectController {
    private projectService = new ProjectService();

    @RequireAuth() 
    @Post("/")
    async createProject(@Body() project: Omit<IProject, "_id">, @Req() req: Request, @Res() res: Response) {
        try {
            const newProject = await this.projectService.createProject(project);
            res.status(201).json(newProject);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    }

    @RequireAuth()
    @Get("/")
    async getProjects(@Req() req: Request, @Res() res: Response) {
        try {
            const projects = await this.projectService.getProjects();
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    }
}
