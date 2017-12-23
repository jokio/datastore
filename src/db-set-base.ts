import * as Datastore from '@google-cloud/datastore'
import { OneOrMany, DatastoreKey } from '@google-cloud/datastore/entity';
import { CommitResponse } from '@google-cloud/datastore/request';
import { Query, QueryInfo, QueryOptions } from '@google-cloud/datastore/query';
import { Entity } from "./types";


export type QueryProcessor = (x: Query) => Query

export abstract class DbSetBase<TEntity extends Entity> {
	constructor(
		protected kind: string,
		protected datastore: Datastore
	) { }


	protected abstract onSave(entities: OneOrMany<object>): Promise<CommitResponse | undefined>;
	protected abstract onGet<TResult = any>(key: DatastoreKey, options?: QueryOptions): Promise<TResult | undefined>;
	protected abstract onCreateQuery(kind: string): Query
	protected abstract onRunQuery<TResult = any>(query: Query, options?: QueryOptions): Promise<[TResult[], QueryInfo]>


	async save(...items: TEntity[]): Promise<CommitResponse | undefined> {
		const entities = items.map((x: any) => ({
			key: this.datastore.key([this.kind, x.id]),
			data: {
				...x,
				...{ lastUpdatedAt: new Date() }
			}
		}));

		return await this.onSave(entities);
	}

	async saveAndGet(item: TEntity): Promise<TEntity> {

		const itemX: any = item;
		const entity = {
			key: this.datastore.key([this.kind, item.id]),
			data: {
				...itemX,
				...{ lastUpdatedAt: new Date() }
			}
		};

		const result = await this.onSave(entity);
		const result2 = await this.onGet(entity.key);

		return result2;
	}

	async get(id: any): Promise<TEntity> {
		if (!id)
			return null;

		const key = this.datastore.key([this.kind, id.toString()]);
		const result = await this.onGet(key);

		return result;
	}

	async query(queryProcessor: (x: Query) => Query = x => x, options?: QueryOptions): Promise<TEntity[]> {
		const query = queryProcessor(this.onCreateQuery(this.kind))

		const [result] = await this.onRunQuery(query, options)

		return result;
	}

	async queryWithInfo(queryProcessor: QueryProcessor = x => x, options?: QueryOptions): Promise<{ result: TEntity[], queryInfo: QueryInfo }> {
		const query = queryProcessor(this.onCreateQuery(this.kind))

		const [result, queryInfo] = await this.onRunQuery(query, options)

		return {
			result,
			queryInfo
		};
	}
}
