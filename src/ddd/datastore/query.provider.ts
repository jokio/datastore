import { Query, QueryInfo, QueryOptions } from '@google-cloud/datastore/query';

export type DatastoreQueryProvider = string;

export const query = (queryProcessor?: (x: Query) => Query, options?: QueryOptions) =>
	db.query(queryProcessor, options);
