import { get } from 'dot-prop';
import fetchImpl from 'node-fetch';

interface ClientOptions {
	token: string;
	clientState: { [key: string]: any };
	integrationId: string;
	installationId: string;
	organizationId: string | null;
	isStaging: boolean;
}

export default class WelinaClient {
	options: ClientOptions;

	constructor(options: ClientOptions) {
		this.options = options;
	}

	fetch(query: string, variables?: { [key: string]: any } | null) {
		const graphqlUrl = this.options.isStaging ? `https://welina-graphql-dev.herokuapp.com/v1/graphql` : `https://graphql.welina.io/v1/graphql`;

		const body = JSON.stringify({ query, variables });

		const opts = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.options.token}`
			},
			body
		};

		return fetchImpl(graphqlUrl, opts);
	}

	async fetchAndThrow(query: string, variables?: { [key: string]: any } | null) {
		try {
			const res = await this.fetch(query, variables);
			return res.json();
		} catch (error) {
			console.log('error', error);
			throw new Error(`Failed Welina graphql call. query: ${query}`);
		}
	}

	async getMetadata() {
		const variables = { installationId: this.options.installationId };
		const query = `
			query($installationId: uuid!) {
				installation_by_pk(id: $installationId) {
					id
					metadata
					organisation_id
					integration_id
				}
			}
		`
		const res = await this.fetchAndThrow(query, variables);
		return get(res, 'data.installation_by_pk.metadata') || {};
	}

	updateMetadata(data: Object = {}) {
		const variables = { installationId: this.options.installationId, data };
		const query = `
			mutation($data: jsonb, $installationId: uuid!) {
				update_installation(where: {id: {_eq: $installationId}}, _append: {metadata: $data}) {
					returning {
						metadata
						id
					}
				}
			}
		`

		return this.fetchAndThrow(query, variables);
	}

	setMetadata(data: Object = {}) {
		const variables = { installationId: this.options.installationId, data };
		const query = `
			mutation($data: jsonb, $installationId: uuid!) {
				update_installation(where: {id: {_eq: $installationId}}, _set: {metadata: $data}) {
					returning {
						metadata
						id
					}
				}
			}
		`

		return this.fetchAndThrow(query, variables);
	}
}