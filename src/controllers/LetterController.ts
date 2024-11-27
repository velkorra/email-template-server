import { Controller, Post, Body, Req, Res } from "@decorators/express";
import { Request, Response } from "express";
import { LetterService } from "../services/LetterService";
import { ILetter } from "../models/Letter";

@Controller("/letters")
export class LetterController {
    private letterService = new LetterService();

    @Post("/")
    async createLetter(@Body() letter: Omit<ILetter, "_id">, @Req() req: Request, @Res() res: Response) {
        try {
            const newLetter = await this.letterService.createLetter(letter);
            res.status(201).json(newLetter);
        } catch (error: unknown) {  
            if (error instanceof Error) { 
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            } else {
                res.status(500).json({ message: "Unknown Error", error: "Unknown error occurred" });
            }
        }
    }
}
