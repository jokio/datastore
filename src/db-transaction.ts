import * as Datastore from '@google-cloud/datastore'
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';

export const configureTransaction = (datastore: Datastore) => {
	return async (process: (tran: DatastoreTransaction) => Promise<any>) => {
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
