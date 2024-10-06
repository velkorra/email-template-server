export class RefreshTokenExpiredError extends Error {
    constructor(message: string) {
        super(message);
    }
}
