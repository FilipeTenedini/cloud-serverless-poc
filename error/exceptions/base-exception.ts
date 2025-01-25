export class BaseException extends Error {
	constructor(
		message: string,
        public statusCode: number,
        public requestId: string,
        public errorCode: string) {
		super(message);
		this.name = this.constructor.name;
	}
}