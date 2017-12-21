import * as Datastore from '@google-cloud/datastore';
import { DbSet, configureTransaction, Entity } from './';

const datastore = new Datastore({ namespace: 'dev' });

const db = {
	transaction: configureTransaction(datastore),
	Users: new DbSet<any>('Users', datastore)
};


(async () => {
	console.log('Started');

	const items = await db.Users.query();
	console.log(items.length);

	const t = await db.Users.saveAndGet({ id: 6, name: 'Ezeki' });
	console.log(t);

	const newItems = await db.Users.query();
	console.log(newItems.length);
})();
