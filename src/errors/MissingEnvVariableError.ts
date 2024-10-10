export class MissingEnvVariableError extends Error {
    constructor(name: String) {
        super(`Env variable not found ${name}`);
    }
}
