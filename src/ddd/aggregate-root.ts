import { DomainEvent } from './domain-event';
import { Provider } from './Provider';

export abstract class AggregateRoot<TState extends State, TQuery> {

	protected state: TState;
	// private db: DbSetBase<TState>;

	// protected aggregates: { [key: string]: Aggregate<any> }

	// private doTransaction: (process: ProcessDbTransaction<TState>) => Promise<void>;


	constructor(private kind: string, private dbContext: DbContext) {
		// this.db = this.parentTransaction
		// 	? new DbTransaction<TState>(this.kind, this.datastore, this.parentTransaction)
		// 	: new DbSet<TState>(this.kind, this.datastore);

		// this.doTransaction = configureDbTransaction(kind, datastore);
	}


	async load(id: any) {

		this.state =

			this.state = await this.db.get(id);
		if (this.state == null)
			throw new Error('ENTITY_NOT_FOUND');

		if (this.aggregates) {
			this.updateToAggregateStates();
			this.updateFromAggregateStates();
		}

		this.stateLoaded(this.state);

		return this.state;
	}

	protected stateLoaded(state: TState) { }

	protected async save<T>(Event: DomainEvent<T>, data: T, withTransaction = false) {
		save({
			db: this.dbContext.db,
			kind: this.kind,
			useTransaction: withTransaction
		})(this.state);
	}

	// query: TQuery

	// query(queryProcessor?: QueryProcessor, options?: QueryOptions) {
	// 	return this.db.query(queryProcessor, options);
	// }

	// queryWithMetadata(queryProcessor?: QueryProcessor, options?: QueryOptions) {
	// 	return this.db.queryWithInfo(queryProcessor, options);
	// }

	// protected transaction(process: ProcessDbTransaction<TState>) {
	// 	return this.doTransaction(process);
	// }


	// private updateToAggregateStates() {
	// 	if (!this.aggregates) return;

	// 	const defaultState: any = {};

	// 	for (let i in this.aggregates) {
	// 		const aggr = this.aggregates[i];
	// 		if (!aggr) continue;

	// 		aggr.state = this.state[i];
	// 	}
	// }

	// private updateFromAggregateStates() {
	// 	if (!this.aggregates) return;

	// 	const defaultState: any = {};

	// 	this.state = this.state || defaultState;

	// 	for (let i in this.aggregates) {
	// 		const aggr = this.aggregates[i];
	// 		if (!aggr) continue;

	// 		this.state[i] = aggr.state;
	// 	}
	// }
}


export interface State {
	id: number | string;
	version: string;
}


export interface DbContext {
	db: any;
	parentTransaction?: any;
	provider: Provider
}
