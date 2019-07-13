// import fetchImpl from 'node-fetch';
// import { createHash } from 'crypto';
// import { FetchOptions } from './types';

interface ClientOptions {
	token: string;
	teamId: string | null | undefined;
	integrationId: string;
	configurationId: string;
	slug: string;
}

export default class WelinaClient {
	options: ClientOptions;

	constructor(options: ClientOptions) {
		this.options = options;
	}
}