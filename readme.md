# Datastore Toolkit

[![Build Status](https://travis-ci.org/jokio/datastore.svg?branch=master)](https://travis-ci.org/jokio/datastore)

[![npm version](https://badge.fury.io/js/%40jokio%2Fdatastore.svg)](https://badge.fury.io/js/%40jokio%2Fdatastore) [![Greenkeeper badge](https://badges.greenkeeper.io/jokio/datastore.svg)](https://greenkeeper.io/)


## How to use
Simple:
```ts
import { DbSet, configureTransaction, Entity, Datastore } from '@jokio/datastore';

const datastore = new Datastore({});

const db = {
	transaction: configureTransaction(datastore),
	users: new DbSet<UserEntity>('users', datastore),
	accounts: new DbSet<AccountEntity>('accounts', datastore),
};


interface UserEntity extends Entity {
	firstName: string
	lastName: string
}

interface AccountEntity extends Entity {
	currency: string
	amount: number
}
```

OOP Style:
```ts
import { Entity, DbSet, DbContext, Datastore } from '@jokio/datastore';


export default class extends DbContext {
	Users: DbSet<UserEntity>
	Accounts: DbSet<AccountEntity>

	constructor(datastore: Datastore) {
		super(datastore);

		this.Users = new DbSet<UserEntity>('Users', datastore)
		this.Accounts = new DbSet<AccountEntity>('Accounts', datastore)
	}
}


interface UserEntity extends Entity {
	firstName: string
	lastName: string
}

interface AccountEntity extends Entity {
	currency: string
	amount: number
}

...

const db = new DbContext(datastore);
```


DDD Style:
```ts
import { Entity, Aggregate, AggregateResolver, Datastore } from "@jokio/datastore";


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
```

Gangnam Style:
```ts
console.log('commong soon... :D');
```