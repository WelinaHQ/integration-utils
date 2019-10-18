import { RequestInit } from 'node-fetch';
import WelinaClient from './welina-client';

export interface HandlerOptions {
	payload: UiHookPayload;
	welinaClient: WelinaClient;
}

export interface UiHookPayload {
	action: string;
	clientState: { [key: string]: string | number | string[] };
	query: { [key: string]: string | number | string[] };
	integrationId: string;
	installationId: string;
	organizationId: string | null;
	token: string;
	isStaging: boolean;
}

export interface FetchOptions extends RequestInit {
	data?: object;
}

export { WelinaClient };

export interface APIClass {
	get: any,
	post: any,
	[key: string]: any;
}