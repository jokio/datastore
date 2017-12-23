import * as Datastore from '@google-cloud/datastore';
import {
	DbSet,
	configureTransaction,
	Entity,
	ProcessTransaction,
	ProcessDbTransaction,
	DbTransaction,
	Aggregate,
	AggregateConstructor,
	AggregateResolver
} from './';

const datastore = new Datastore({ namespace: 'dev' });

// const db = {
// 	transaction: configureTransaction(datastore),
// 	Users: new DbSet<any>('Users', datastore)
// };


// (async () => {
// 	console.log('Started');

// 	const items = await db.Users.query();
// 	console.log(items.length);

// 	const xx2 = await db.Users.save({});
// 	xx2

// 	const t = await db.Users.saveAndGet({ id: 6, name: 'Ezeki' });
// 	console.log(t);

// 	const newItems = await db.Users.query();
// 	console.log(newItems.length);
// });





// const run = async () => {
// 	const userAggr = resolver.get(UserAggregate);

// 	await userAggr.load(1);
// 	await userAggr.resetPassword();
// 	await userAggr.save();
// }
// run();

// class AggregatRoot {
// 	resolver: AggregateResolver;

// 	constructor(datastore: Datastore) {
// 		this.resolver = new AggregateResolver(datastore);
// 	}

// 	get user() {
// 		return this.resolver.get(UserAggregate);
// 	}
// }

// const root = new AggregatRoot(datastore);


// (async () => {
// 	const user = root.user;

// 	await user.load(1);
// 	await user.resetPassword();
// 	await user.save();
// })()
