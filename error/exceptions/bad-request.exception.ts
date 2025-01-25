import { BaseException } from './base-exception';

export class BadRequestException extends BaseException {
	constructor(message: string, requestId: string) {
		super(message, 400, requestId, 'BAD_REQUEST');
	}
}