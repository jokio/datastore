import { AggregateRoot, Entity, DomainEvent, uniqueId } from "../../";



export class AccountAggregate extends AggregateRoot<AccountState> {

	static Events = {
		Registered: new DomainEvent<RegisteredEvent>()
	}


	constructor(datastore, parentTransaction) {
		super('Accounts', datastore, parentTransaction)
	}


	async register(props: RegisterProps) {

		const defaultProps = {
			id: uniqueId(),
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


		let startTime = Date.now();
		const result = await this.save(AccountAggregate.Events.Registered, eventData, true);
		console.log('xx', Date.now() - startTime); startTime = Date.now();

		return result;
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
