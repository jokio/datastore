import * as Datastore from '@google-cloud/datastore'
import { OneOrMany } from '@google-cloud/datastore/entity';
import { QueryOptions, Query, QueryInfo } from '@google-cloud/datastore/query';
import { CommitResponse } from '@google-cloud/datastore/request';
import { Entity } from './types';


export class DbSet<TEntity extends Entity> {

	constructor(
		private kind: string,
		private datastore: Datastore,
	) { }

	async save(...items: TEntity[]): Promise<CommitResponse> {
		const entities = items.map((x: any) => ({
			key: this.datastore.key([this.kind, x.id]),
			data: {
				...x,
				...{ lastUpdatedAt: new Date() }
			}
		}));

		const [result] = await this.datastore.save(entities);

		return result;
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

		const [result] = await this.datastore.save(entity);
		const [result2]: [any] = await this.datastore.get(entity.key);

		return result2;
	}

	async get(id: any): Promise<TEntity> {
		if (!id)
			return null;

		const key = this.datastore.key([this.kind, id.toString()]);
		const [result]: [any] = await this.datastore.get(key);

		return result;
	}

	async query(queryProcessor: (x: Query) => Query = x => x, options?: QueryOptions): Promise<TEntity[]> {
		const query = queryProcessor(this.datastore.createQuery(this.kind))

		const [result]: [any[], QueryInfo] = await this.datastore.runQuery(query, options)

		return result;
	}

	async queryWithInfo(queryProcessor: (x: Query) => Query = x => x, options?: QueryOptions): Promise<{ result: TEntity[], queryInfo: QueryInfo }> {
		const query = queryProcessor(this.datastore.createQuery(this.kind))

		const [result, queryInfo]: [any[], QueryInfo] = await this.datastore.runQuery(query, options)

		return {
			result,
			queryInfo
		};
	}
}
