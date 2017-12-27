import * as Datastore from '@google-cloud/datastore'
import { QueryOptions, QueryInfo } from '@google-cloud/datastore/query';
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';
import { Entity } from './types';
import { DbSet } from './db-set';
import { ProcessDbTransaction, DbTransaction, configureDbTransaction } from './db-transaction';
import { QueryProcessor, DbSetBase } from './db-set-base';
import { Event } from './event';

export type DomainEventAction<TData> = (data: TData) => Promise<void>;

export class DomainEvent<TData> extends Event<DomainEventData<TData>> { }

export abstract class AggregateRoot<TState extends Entity> {

	protected state: TState;
	private db: DbSetBase<TState>;

	protected aggregates: { [key: string]: Aggregate<any> }

	private doTransaction: (process: ProcessDbTransaction<TState>) => Promise<void>;


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

		if (this.aggregates) {
			this.updateToAggregateStates();
			this.updateFromAggregateStates();
		}

		this.stateLoaded(this.state);

		return this.state;
	}

	protected stateLoaded(state: TState) { }

	protected async save<T>(Event: DomainEvent<T>, data: T) {

		const doSave = async (dbTran: DbTransaction<TState>, transaction: DatastoreTransaction) => {

			if (!this.state)
				return;

			this.updateFromAggregateStates();

			if (this.state.lastUpdatedAt) {
				const item = await dbTran.get(this.state.id);

				if (item.lastUpdatedAt.toString() != this.state.lastUpdatedAt.toString())
					throw new Error('VERSION_CHANGED');
			}

			await dbTran.save(this.state);

			this.updateToAggregateStates();

			await Event.post({ transaction, data });
		}

		if (this.parentTransaction) {

			const dbTransaction = new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction);

			await doSave(dbTransaction, this.parentTransaction);

			return this.state;
		}

		await this.transaction(doSave);

		return this.state;
	}

	query(queryProcessor?: QueryProcessor, options?: QueryOptions) {
		return this.db.query(queryProcessor, options);
	}

	queryWithMetadata(queryProcessor?: QueryProcessor, options?: QueryOptions) {
		return this.db.queryWithInfo(queryProcessor, options);
	}

	protected transaction(process: ProcessDbTransaction<TState>) {
		return this.doTransaction(process);
	}


	private updateToAggregateStates() {
		if (!this.aggregates) return;

		const defaultState: any = {};

		for (let i in this.aggregates) {
			const aggr = this.aggregates[i];
			if (!aggr) continue;

			aggr.state = this.state[i];
		}
	}

	private updateFromAggregateStates() {
		if (!this.aggregates) return;

		const defaultState: any = {};

		this.state = this.state || defaultState;

		for (let i in this.aggregates) {
			const aggr = this.aggregates[i];
			if (!aggr) continue;

			this.state[i] = aggr.state;
		}
	}
}

export abstract class Aggregate<TState> {

	abstract defaultState: TState

	private _state: TState;
	get state(): TState {
		if (!this._state)
			this._state = this.defaultState;

		return this._state;
	}
	set state(value: TState) {
		this._state = value;
	}

	constructor() {
		this.state = this.defaultState;
	}
}

export class AggregateRootResolver {
	constructor(private datastore: Datastore) { }

	get<T>(aggregateType: AggregateConstructor<T>, transaction?: DatastoreTransaction): T {
		return new aggregateType(this.datastore, transaction);
	}
}


// types
export interface AggregateConstructor<T> {
	new(datastore: Datastore, transaction?: DatastoreTransaction): T;
}

export interface DomainEventData<TData> {
	transaction: DatastoreTransaction
	data: TData
}
