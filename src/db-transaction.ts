import * as Datastore from '@google-cloud/datastore'
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';

export type ProcessTransaction = (tran: DatastoreTransaction) => Promise<any>

export const configureTransaction = (datastore: Datastore) => {
	return async (process: ProcessTransaction) => {
		const tran = datastore.transaction();

		try {
			await tran.run();
			await process(tran);
			await tran.commit();
		}
		catch (err) {
			tran.rollback(err);
		}

		datastore.transaction()
	}
}
