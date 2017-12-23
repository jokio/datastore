import * as Datastore from '@google-cloud/datastore'
import { OneOrMany, DatastoreKey } from '@google-cloud/datastore/entity';
import { QueryOptions, Query, QueryInfo } from '@google-cloud/datastore/query';
import { CommitResponse } from '@google-cloud/datastore/request';
import { Entity } from './types';
import { DbSetBase } from './db-set-base';

export class DbSet<TEntity extends Entity> extends DbSetBase<TEntity> {

	constructor(
		kind: string,
		datastore: Datastore,
	) { super(kind, datastore); }


	protected async onSave(entities: OneOrMany<object>): Promise<CommitResponse | undefined> {
		const [result] = await this.datastore.save(entities);

		return result;
	}

	protected async onGet<TResult = any>(key: DatastoreKey, options?: QueryOptions): Promise<TResult | undefined> {
		const [result]: [any] = await this.datastore.get(key, options);

		return result;
	}

	protected onCreateQuery(kind: string): Query {
		return this.datastore.createQuery(this.kind);
	}

	protected async onRunQuery<TResult = any>(query: Query, options?: QueryOptions): Promise<[TResult[], QueryInfo]> {
		const results: [any[], QueryInfo] = await this.datastore.runQuery(query, options)

		return results;
	}
}
