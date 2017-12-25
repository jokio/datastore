import * as Datastore from '@google-cloud/datastore'
import { QueryOptions, QueryInfo } from '@google-cloud/datastore/query';
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';
import { Entity } from './types';
import { DbSet } from './db-set';
import { ProcessDbTransaction, DbTransaction, configureDbTransaction } from './db-transaction';
import { QueryProcessor } from './db-set-base';
import { AnyEvent, EventType, flushOnce } from 'ts-events';

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
	private db: DbSet<TState>;

	private doTransaction: (process: ProcessDbTransaction<TState>, onFinally?: () => void) => Promise<boolean>;

	constructor(private kind: string, private datastore: Datastore, private parentTransaction?: DatastoreTransaction) {
		this.db = new DbSet<TState>(this.kind, this.datastore);
		this.doTransaction = configureDbTransaction(kind, datastore);
	}

	async load(id: any) {
		this.state = await this.db.get(id);

		return this.state;
	}

	protected save<T>(Event: DomainEvent<T>, data: T) {
		const doAction = async (x: DbTransaction<TState>, transaction: DatastoreTransaction) => {

			if (!this.state)
				return;

			if (this.state.lastUpdatedAt) {
				const item = await x.get(this.state.id);

				if (item.lastUpdatedAt != this.state.lastUpdatedAt)
					throw new Error('VERSION_CHANGED');
			}

			await x.save(this.state);

			Event.post({ transaction, data });
		}

		if (this.parentTransaction) {

			const dbTransaction = new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction);

			doAction(dbTransaction, this.parentTransaction);

			return true;
		}

		return this.transaction(doAction, flushOnce);
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
