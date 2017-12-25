import { Entity, Aggregate, AggregateResolver, Datastore, DomainEvent } from "../";
import { AnyEvent, EventType } from "ts-events";
import { DatastoreTransaction } from "@google-cloud/datastore/transaction";


// 1. Declare Types
interface UserState extends Entity {
	firstName: string
	lastName: string
	password: string
}

interface RegisterProps {
	firstName: string
	lastName: string
	password: string
}


// 2. Declare Aggregate
class UserAggregate extends Aggregate<UserState>  {

	static Events = {
		Register: new DomainEvent<UserState>(),
		PasswordChange: new DomainEvent<UserState>(),
	}


	constructor(datastore, transaction?: DatastoreTransaction) {
		super('users', datastore);
	}


	// commands
	register(props: RegisterProps) {

		this.state = {
			...this.state,
			...props,
			id: Date.now(),
		};

		return this.save(UserAggregate.Events.Register, this.state);
	}

	resetPassword() {
		this.state.password = null;

		return this.save(UserAggregate.Events.PasswordChange, this.state);
	}
}

UserAggregate.Events.Register.attachAsync({ ez: 1 }, ({ transaction: tr, data }) => {
	try {
		console.log('OnRegister', this);
		throw new Error('aaa');
	}
	catch (err) {
		console.log('asd', err);
	}
})


// 3. Use Aggregate
async function run() {
	const datastore = new Datastore({});
	const root = new AggregateResolver(datastore);
	const userAggr = root.get(UserAggregate);

	const isSuccess = await userAggr.register({
		firstName: 'Ezeki222',
		lastName: 'Zibzibadze',
		password: '123'
	});

	console.log(isSuccess);
}


run();
