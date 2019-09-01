import { get } from 'dot-prop';
import fetchImpl from 'node-fetch';

interface ClientOptions {
	token: string;
	clientState: { [key: string]: any };
	integrationId: string;
	installationId: string;
	organizationId: string | null;
}

export default class WelinaClient {
	options: ClientOptions;

	constructor(options: ClientOptions) {
		this.options = options;
	}

	fetch(query: string, data?: { [key: string]: any } | null) {
		const graphqlUrl = `https://welina-graphql.herokuapp.com/v1/graphql`;

		const opts = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.options.token}`
			},
			body: data ? JSON.stringify({ query, variables: data }) : JSON.stringify({ query })
		};

		return fetchImpl(graphqlUrl, opts)
	}

	async fetchAndThrow(query: string, data?: { [key: string]: any } | null) {
		try {
			const res = await this.fetch(query, data);
			return res.body as { [key: string]: any; };
		} catch (error) {
			console.log('error', error)
			throw new Error(`Failed Welina graphql call. query: ${query}`);
		}
	}

	async getMetadata() {
		const query = `
		{
			installation(where: {installation_id: {_eq: ${this.options.installationId}}}) {
				id
				metadata
				organisation_id
				integration_id
			}
		}
		`
		const response = await this.fetchAndThrow(query);
		return get(response, 'data.installation.metadata') || {};
	}

	updateMetadata(data: Object = {}) {
		const query = `
		{
			mutation($data: jsonb) {
				update_installation(where: {id: {_eq: ${this.options.installationId}}}, _append: {metadata: $data}) {
					returning {
						metadata
						id
					}
				}
			}
			
		}
		`

		return this.fetchAndThrow(query, data);
	}

	setMetadata(data: Object = {}) {
		const query = `
		{
			mutation($data: jsonb) {
				update_installation(where: {id: {_eq: ${this.options.installationId}}}, _set: {metadata: $data}) {
					returning {
						metadata
						id
					}
				}
			}
			
		}
		`

		return this.fetchAndThrow(query, data);
	}
}