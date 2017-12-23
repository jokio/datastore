import * as Datastore from '@google-cloud/datastore'
import { Entity } from './types';
import { DbSet } from './db-set';
import { ProcessDbTransaction, DbTransaction, configureDbTransaction } from './db-transaction';
import { QueryProcessor } from './db-set-base';
import { QueryOptions, QueryInfo } from '@google-cloud/datastore/query';


export interface AggregateConstructor<T> {
	new(datastore: Datastore): T;
}

export class Aggregate<TState extends Entity> {

	protected state: TState;
	private db: DbSet<TState>;

	private doTransaction: (process: ProcessDbTransaction<TState>) => Promise<boolean>;

	constructor(private kind: string, private datastore: Datastore) {
		this.db = new DbSet<TState>(this.kind, this.datastore);
		this.doTransaction = configureDbTransaction(kind, datastore);
	}

	load(id: any) {
		this.db.get(id).then(x => this.state = x);
	}

	protected save() {
		return this.transaction(async x => {

			if (!this.state)
				return;

			if (this.state.lastUpdatedAt) {
				const item = await x.get(this.state.id);

				if (item.lastUpdatedAt != this.state.lastUpdatedAt)
					throw new Error('VERSION_CHANGED');
			}

			await x.save(this.state);
		})
	}

	query(queryProcessor: QueryProcessor, options: QueryOptions) {
		return this.db.query(queryProcessor, options);
	}

	queryWithMetadata(queryProcessor: QueryProcessor, options: QueryOptions) {
		return this.db.queryWithInfo(queryProcessor, options);
	}

	protected transaction(process: ProcessDbTransaction<TState>) {
		return this.doTransaction(process);
	}
}


export class AggregateResolver {
	constructor(private datastore: Datastore) { }

	get<T>(aggregateType: AggregateConstructor<T>): T {
		return new aggregateType(this.datastore);
	}
}
