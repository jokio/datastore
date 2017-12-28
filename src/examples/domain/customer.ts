import { AggregateRoot, Entity, DomainEvent, Aggregate, uniqueId } from "../../";


export class CustomerAggregate extends AggregateRoot<CustomerState> {

	static Events = {
		Registered: new DomainEvent<CustomerRegisteredEvent>(),
		AccountsCountUpdated: new DomainEvent<AccountsCountUpdatedEvent>(),
	}

	protected aggregates = {
		operations: new OperationsAggregate()
	}

	constructor(datastore, parentTransaction) {
		super('Customers', datastore, parentTransaction)
	}


	register(props: RegisterCustomerProps) {

		const defaultProps = {
			id: uniqueId(),
			accountsCount: 0,
			operations: this.aggregates.operations.defaultState,
		}

		this.state = {
			...defaultProps,
			...props,
		}

		const eventData = {
			id: this.state.id,
			name: this.state.name,
			accountsCount: this.state.accountsCount,
		}

		this.aggregates.operations.add();

		return this.save(CustomerAggregate.Events.Registered, eventData)
	}

	async updateAccountsCount(props: UpdateAccountsCountProps) {

		switch (props.operationType) {
			case 'add':
				this.state.accountsCount++;
				break;

			case 'remove':
				this.state.accountsCount++;
				break;
		}

		const eventData = {
			customerId: this.state.id,
			totalCount: this.state.accountsCount,
		}

		const result = await this.save(CustomerAggregate.Events.AccountsCountUpdated, eventData);

		return result;
	}
}


// State
export interface CustomerState extends Entity {
	name: string
	accountsCount: number
	operations: OperationsState
}


// Props
export interface RegisterCustomerProps {
	name: string
}

export interface UpdateAccountsCountProps {
	operationType: 'add' | 'remove'
}


// Event
export interface CustomerRegisteredEvent {
	id: string
	name: string
	accountsCount: number
}

export interface AccountsCountUpdatedEvent {
	customerId: string
	totalCount: number
}


















export class OperationsAggregate extends Aggregate<OperationsState> {

	defaultState = {
		count: 0
	}

	add() {
		this.state.count++;
	}
}



// Types
export interface OperationsState {
	count: number
}
