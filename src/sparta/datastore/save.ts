import * as Datastore from '@google-cloud/datastore';
import { DatastoreKey } from "@google-cloud/datastore/entity";
import { uniqueId } from "../../";


export const VERSION_CHANGED = 'VERSION_CHANGED';


export const save = (props: SaveProps = {}) => async (state, context) => {

	const { datastore: db, kind: contextKind } = context;
	const { kind, useTransaction = false, excludeFromIndexes } = props;

	const id = state.id || uniqueId()
	const key = db.key([contextKind || kind, id])
	const isUpdate = !!state.version

	if (isUpdate) {
		return useTransaction
			? updateWithTransaction(db, key, state)
			: update(db, key, state);
	}

	// create
	state.version = uniqueId()

	const [result] = await db.save({ key, data: state, excludeFromIndexes })
	return state
}


export interface SaveProps {
	kind?: string
	useTransaction?: boolean
	excludeFromIndexes?: string[]
}



const updateWithTransaction = async (db: Datastore, key: DatastoreKey, state) => {

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

const update = async (db: Datastore, key: DatastoreKey, state: any) => {
	const [serverState]: [any] = await db.get(key, { consistency: 'strong' })

	if (serverState.version != state.version)
		throw new Error(VERSION_CHANGED)

	state.version = uniqueId()
	const [result] = await db.save(state)

	return state;
}

