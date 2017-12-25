import { Aggregate, Entity, DomainEvent } from "../../";



export class AccountAggregate extends Aggregate<AccountState> {

	static Events = {
		Registered: new DomainEvent<RegisteredEvent>()
	}


	constructor(datastore, parentTransaction) {
		super('Accounts', datastore, parentTransaction)
	}


	async register(props: RegisterProps) {

		const defaultProps = {
			id: Date.now().toString(),
			amount: 0
		}

		this.state = {
			...defaultProps,
			...props,
		}

		const eventData = {
			customerId: this.state.customerId,
			accountId: this.state.id,
		}

		const isSuccess = await this.save(AccountAggregate.Events.Registered, eventData);
		if (!isSuccess)
			throw new Error('Operation Failed');

		return this.state;
	}
}



// State
export interface AccountState extends Entity {
	customerId: string
	currency: string
	amount: number
}


// Props
export interface RegisterProps {
	customerId: string
	currency: string
}


// Events
export interface RegisteredEvent {
	customerId: string
	accountId: string
}
