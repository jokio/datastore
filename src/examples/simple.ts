import { Entity, Datastore, configureTransaction, DbSet } from "../";


// 1. Declare Types
interface UserEntity extends Entity {
	firstName: string
	lastName: string
	password: string
}


// 2. Create db context
const datastore = new Datastore({});

const db = {
	transaction: configureTransaction(datastore),
	users: new DbSet<any>('users', datastore)
};

// 3. Use db context
async function run() {
	let isSuccess = false;

	try {
		await db.users.save({
			id: Date.now(),
			firstName: 'Ezeki',
			lastName: 'Zibzibadze',
			password: '123'
		});

		await db.transaction(async x => {
			x.save({
				key: datastore.key(['users', 1]),
				data: {
					firstName: 'Ellen',
					lastName: 'Zibzibadze',
					password: '123'
				},
				excludeFromIndexes: ['password']
			})

			x.save({
				key: datastore.key(['cars', 1]),
				data: {
					name: 'Tesla X',
					type: 'Electro',
				}
			})
		});

		isSuccess = true;
	}
	catch (err) {
		console.log('error', err);
	}

	console.log(isSuccess);
}


run();
