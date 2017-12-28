import * as Datastore from '@google-cloud/datastore';
import { DatastoreKey } from '@google-cloud/datastore/entity';
import { uniqueId } from '../../';


export const VERSION_CHANGED = 'VERSION_CHANGED';


// api
export const configure = (credentials) => (state, context) => {

	credentials = (typeof credentials === 'string')
		? JSON.parse(credentials)
		: credentials

	context.datastore = new Datastore({ credentials })

	return state;
}

export const get = ({ kind, id }) => async (state, { datastore: db, kind: contextKind }) => {

	const key = db.key([contextKind || kind, id])

	const [serverState]: [any] = await db.get(key)

	return serverState
}

export const save = ({ kind, useTransaction = false }: SaveProps) => async (state, { datastore: db, kind: contextKind }) => {

	const id = state.id || uniqueId()
	const key = db.key([kind, id])
	const isUpdate = !!state.version

	if (isUpdate) {
		return useTransaction
			? updateWithTransaction(db, key, state)
			: update(db, key, state);
	}

	// create
	state.version = uniqueId()
	const [result] = await db.save(state)
	return state
}


// types
export interface SaveProps {
	kind: string
	useTransaction?: boolean
}

export interface Entity {
	id: number | string;
	version: string;
}


// helper functions
const getDb = (state: Entity): Datastore => {
	const db: Datastore = state['@jokio/datastore/db'];
	if (!db)
		throw new Error('Please call configure first');

	if (!state)
		throw new Error('State was not defined');

	return db;
}

const updateWithTransaction = async (db: Datastore, key: DatastoreKey, state: Entity) => {

	const tran = db.transaction();

	try {
		await tran.run();

		const [serverState]: [any] = await tran.get(key, { consistency: 'strong' });

		// check version
		if (serverState.version != state.version)
			throw new Error(VERSION_CHANGED);

		// update version
		state.version = uniqueId();

		// save
		tran.save(state);

		// commit
		await tran.commit();

		return state;
	}
	catch (err) {
		await tran.rollback();
		throw err;
	}
}

const update = async (db: Datastore, key: DatastoreKey, state: Entity) => {
	const [serverState]: [any] = await db.get(key, { consistency: 'strong' })

	if (serverState.version != state.version)
		throw new Error(VERSION_CHANGED)

	state.version = uniqueId()
	const [result] = await db.save(state)

	return state;
}

