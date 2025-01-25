import { BaseException } from './base-exception';

export class NotFoundException extends BaseException {
	constructor(message: string, requestId: string) {
		super(message, 404, requestId, 'NOT_FOUND');
	}
}