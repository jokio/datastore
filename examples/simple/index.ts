import GraphQL, { Module } from '@jokio/graphql';

const helloModule: Module = {
	typeDefs: `
	extend type Query {
		hello: String!
	}
	`,

	resolvers: {
		Query: {
			hello: () => 'world'
		}
	}
}

GraphQL.run({
	modules: [helloModule],
	port: 4001
})
