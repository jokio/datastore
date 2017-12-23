import { Entity, Aggregate, AggregateResolver, Datastore } from "../index";


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
	constructor(datastore) {
		super('users', datastore);
	}

	// commands
	register(props: RegisterProps) {

		this.state = {
			...this.state,
			...props,
			id: Date.now(),
		};

		return this.save();
	}

	resetPassword() {
		this.state.password = null;

		return this.save();
	}
}


// 3. Use Aggregate
async function run() {
	const datastore = new Datastore({});
	const root = new AggregateResolver(datastore);
	const userAggr = root.get(UserAggregate);

	const isSuccess = await userAggr.register({
		firstName: 'Ezeki',
		lastName: 'Zibzibadze',
		password: '123'
	});

	console.log(isSuccess);
}


run();
