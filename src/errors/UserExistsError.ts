class UserExistsError extends Error {
    constructor() {
        super("User already exists");
        this.name = "UserExistsError";
    }
}
