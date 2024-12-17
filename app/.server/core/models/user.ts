export type UserId = string & { __type: 'UserId' };

export interface User {
	id: UserId;
	email: string;
}
