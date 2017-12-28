import { AggregateRootResolver, Datastore } from "../index";
import { AccountAggregate, CustomerAggregate, OperationsAggregate } from "./domain";
import { setTimeout } from "timers";

const credentials = undefined;
const datastore = new Datastore({ credentials });
const domain = new AggregateRootResolver(datastore);


AccountAggregate.Events.Registered.attachSafe(async x => {
	console.log('account created', x.data.customerId)
	const customer = domain.get(CustomerAggregate)

	await customer.load(x.data.customerId)
	customer.updateAccountsCount({ operationType: 'add' });

	console.log('accountupdateAccountsCount completed', x.data.customerId)
})

CustomerAggregate.Events.Registered.attach(async x => {
})


async function run() {
	const account = domain.get(AccountAggregate);
	const customer = domain.get(CustomerAggregate);

	const job = () => setTimeout(async () => {
		const { id: customerId } = await customer.register({ name: 'test' });
		console.log('customer created', customerId);
		account.register({ currency: 'GEL', customerId })
	}, 0);

	job();
	job();
	job();
	job();
	job();
	job();
	job();
	// console.log(await c.register({ name: 'Ezeki' }))
	// const state = await c.load('1514391599395');
	// c.updateAccountsCount({ operationType: 'add' });

	// c.updateAccountsCount({ operationType: 'add' });
	// c.updateAccountsCount({ operationType: 'add' });
	// c.updateAccountsCount({ operationType: 'add' });
}

run();
