import * as Datastore from '@google-cloud/datastore'
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';
import { CommitResponse } from '@google-cloud/datastore/request';
import { OneOrMany, DatastoreKey } from '@google-cloud/datastore/entity';

import { DbSetBase } from './db-set-base';
import { Entity } from './types';
import { QueryOptions, Query, QueryInfo } from '@google-cloud/datastore/query';


export class DbTransaction<TEntity extends Entity> extends DbSetBase<TEntity> {

	constructor(
		kind: string,
		datastore: Datastore,
		protected transaction: DatastoreTransaction
	) { super(kind, datastore); }


	protected async onSave(entities: OneOrMany<object>): Promise<CommitResponse | undefined> {
		this.transaction.save(entities);

		return new Promise<any>(resolve => resolve(undefined));
	}

	protected async onGet<TResult = any>(key: DatastoreKey, options?: QueryOptions): Promise<TResult | undefined> {
		const [result]: [any] = await this.transaction.get(key, options);

		return result;
	}

	protected onCreateQuery(kind: string): Query {
		return this.transaction.createQuery(this.kind);
	}

	protected async onRunQuery<TResult = any>(query: Query, options?: QueryOptions): Promise<[TResult[], QueryInfo]> {
		const results: [any[], QueryInfo] = await this.transaction.runQuery(query, options)

		return results;
	}
}



export type ProcessTransaction = (tran: DatastoreTransaction, datastore: Datastore) => Promise<void>

export const configureTransaction = (datastore: Datastore) => {
	return async (process: ProcessTransaction) => {
		const tran = datastore.transaction();

		try {
			await tran.run();
			await process(tran, datastore);
			await tran.commit();

			return true;
		}
		catch (err) {
			tran.rollback(err);
			return false;
		}
	}
}


export type ProcessDbTransaction<TEntity extends Entity> = (tran: DbTransaction<TEntity>, datastoreTran: DatastoreTransaction) => Promise<void>

export const configureDbTransaction = <TEntity extends Entity>(kind: string, datastore: Datastore) => {
	return async (process: ProcessDbTransaction<TEntity>, onFinally?: () => void) => {
		const tran = datastore.transaction();
		let isSuccess = false;

		try {
			const dbTransaction = new DbTransaction<TEntity>(kind, datastore, tran);

			await tran.run();
			await process(dbTransaction, tran);
			await tran.commit();

			isSuccess = true;
		}
		catch (err) {
			console.warn(err);
			tran.rollback(err);
		}


		onFinally();
		return isSuccess;
	}
}
