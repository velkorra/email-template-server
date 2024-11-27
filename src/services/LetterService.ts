import { Letter } from "../models/Letter"; 
import { ILetter } from "../models/Letter"; 

export class LetterService {
    async createLetter(letter: Omit<ILetter, "_id">): Promise<ILetter> {
        const newLetter = new Letter(letter);
        await newLetter.save(); 
        return newLetter;
    }

    async getLettersByProject(projectId: string): Promise<ILetter[]> {
        return Letter.find({ project: projectId });
    }
}
