import GraphQL, { Module } from '@jokio/graphql';

const remoteSchemaUrls = [
	'https://api.graph.cool/simple/v1/swapi'
]

const extendedModule: Module = {
	typeDefs: `
	extend type Film {
		boxOfficeUSD: Float!
	}
	`,

	resolvers: {
		Film: {
			boxOfficeUSD: () => Math.round(Math.random() * 1000 * 1000)
		}
	}
}


GraphQL.run({
	remoteSchemaUrls,
	modules: [extendedModule],
	port: 4001
});
