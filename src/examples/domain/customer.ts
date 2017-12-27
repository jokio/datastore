import { AggregateRoot, Entity, DomainEvent } from "../../";


export class CustomerAggregate extends AggregateRoot<CustomerState> {

	static Events = {
		Registered: new DomainEvent<CustomerRegisteredEvent>(),
		AccountsCountUpdated: new DomainEvent<AccountsCountUpdatedEvent>(),
	}


	constructor(datastore, parentTransaction) {
		super('Customers', datastore, parentTransaction)
	}


	async register(props: RegisterCustomerProps) {

		const defaultProps = {
			id: Date.now().toString(),
			accountsCount: 0,
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

		const isSuccess = await this.save(CustomerAggregate.Events.Registered, eventData)
		if (!isSuccess)
			throw new Error('Operation Failed');

		return this.state;
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

		return await this.save(CustomerAggregate.Events.AccountsCountUpdated, eventData);
	}
}


// State
export interface CustomerState extends Entity {
	name: string
	accountsCount: number
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
