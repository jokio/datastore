import * as Datastore from '@google-cloud/datastore'
import { QueryOptions, QueryInfo } from '@google-cloud/datastore/query';
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';
import { AnyEvent, EventType, flushOnce } from '@jokio/ts-events';
import { Entity } from './types';
import { DbSet } from './db-set';
import { ProcessDbTransaction, DbTransaction, configureDbTransaction } from './db-transaction';
import { QueryProcessor, DbSetBase } from './db-set-base';

export interface AggregateConstructor<T> {
	new(datastore: Datastore, transaction?: DatastoreTransaction): T;
}

export interface Event<TData> {
	transaction: DatastoreTransaction
	data: TData
}

export class DomainEvent<TData> extends AnyEvent<Event<TData>>{ }

export class Aggregate<TState extends Entity> {

	protected state: TState;
	private db: DbSetBase<TState>;

	private doTransaction: (process: ProcessDbTransaction<TState>, onFinally?: () => void) => Promise<boolean>;

	constructor(private kind: string, private datastore: Datastore, protected parentTransaction?: DatastoreTransaction) {

		this.db = this.parentTransaction
			? new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction)
			: new DbSet<TState>(this.kind, this.datastore);

		this.doTransaction = configureDbTransaction(kind, datastore);
	}

	async load(id: any) {

		if (this.parentTransaction) {
			const dbTransaction = new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction);
			this.state = await dbTransaction.get(id);
		}
		else {
			this.state = await this.db.get(id);
		}

		return this.state;
	}

	protected async save<T>(Event: DomainEvent<T>, data: T) {

		const doSave = async (dbTran: DbTransaction<TState>, transaction: DatastoreTransaction) => {
			if (!this.state)
				return;

			if (this.state.lastUpdatedAt) {
				const item = await dbTran.get(this.state.id);

				if (item.lastUpdatedAt.toString() != this.state.lastUpdatedAt.toString())
					throw new Error('VERSION_CHANGED');
			}

			await dbTran.save(this.state);

			await Event.post({ transaction, data });
		}

		if (this.parentTransaction) {

			const dbTransaction = new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction);

			await doSave(dbTransaction, this.parentTransaction);

			return true;
		}

		return this.transaction(doSave, flushOnce);
	}

	query(queryProcessor?: QueryProcessor, options?: QueryOptions) {
		return this.db.query(queryProcessor, options);
	}

	queryWithMetadata(queryProcessor?: QueryProcessor, options?: QueryOptions) {
		return this.db.queryWithInfo(queryProcessor, options);
	}

	protected transaction(process: ProcessDbTransaction<TState>, onFinallly?: () => void) {
		return this.doTransaction(process, onFinallly);
	}
}


export class AggregateResolver {
	constructor(private datastore: Datastore) { }

	get<T>(aggregateType: AggregateConstructor<T>, transaction?: DatastoreTransaction): T {
		return new aggregateType(this.datastore, transaction);
	}
}
