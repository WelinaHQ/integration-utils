import aws4 from 'aws4';
import got from 'got';

interface ClientOptions {
	token: string;
	clientState: { [key: string]: string | number | string[] };
	integrationId: string;
	installationId: string;
	organizationId: string | null;
}

interface RequestOptions {
	host?: string;
	path?: string;
	region?: string;
	service?: string;
	headers?: { [header: string]: string | number | string[] | undefined; } | undefined;
	signQuery?: boolean;
	method?: string;
	url?: string;
	ecdhCurve?: string;
	rejectUnauthorized?: boolean;
	json?: Object | Array<any> | number | string | boolean | null;
	body?: any;
	responseType?: string;
}

interface fetchResponse {
	metadata: Object;
}

const callIntegrationAPICredentials = {
	accessKeyId: "AKIAS2V2EINFD746EGAO",
	secretAccessKey: "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"
}

export default class WelinaClient {
	options: ClientOptions;

	constructor(options: ClientOptions) {
		this.options = options;
	}

	fetch(path: string, options: RequestOptions) {
		let baseUrl = `https://eg4vfkb6jd.execute-api.eu-central-1.amazonaws.com/dev/`;

		const awsClient = got.extend({
			baseUrl: baseUrl,
			headers: { 'X-Welina-Token': this.options.token },
			hooks: {
				beforeRequest: [
					async options => {
						aws4.sign(options, callIntegrationAPICredentials);
					}
				]
			}
		});

		return awsClient(path, options);
	}

	async fetchAndThrow(path: string, options: RequestOptions) {
		try {
			const res = await this.fetch(path, options);
			return res.body as unknown as fetchResponse;
		} catch (error) {
			console.log('error', error)
			throw new Error(`Failed Welina API call. path: ${path}`);
		}
	}

	async getMetadata() {
		const metadataApiEndpoint = `integrations/${
			this.options.integrationId
			}/installations/${
			this.options.installationId
			}/metadata`;
		const response = await this.fetchAndThrow(metadataApiEndpoint, {
			method: 'GET',
			json: true,
			responseType: 'json',
		});
		return response.metadata;
	}

	updateMetadata(data: Object = {}) {
		const metadataApiEndpoint = `integrations/${
			this.options.integrationId
			}/installations/${
			this.options.installationId
			}/metadata`;
		return this.fetchAndThrow(metadataApiEndpoint, {
			method: 'POST',
			body: data,
			json: true,
			responseType: 'json',
		});
	}

	setMetadata(data: Object = {}) {
		const metadataApiEndpoint = `integrations/${
			this.options.integrationId
			}/installations/${
			this.options.installationId
			}/metadata`;
		return this.fetchAndThrow(metadataApiEndpoint, {
			method: 'POST',
			body: data,
			json: true,
			responseType: 'json'
		});
	}
}