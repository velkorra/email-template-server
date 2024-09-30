export class LoginError extends Error {
    constructor() {
        super("Invalid login credentials");
        this.name = "LoginError";
    }
}
