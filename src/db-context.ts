import * as Datastore from '@google-cloud/datastore'
import { ProcessTransaction, configureTransaction } from "./db-transaction";


export class DbContext {
	private doTransaction: (process: ProcessTransaction) => Promise<boolean>;

	constructor(datastore: Datastore) {
		this.doTransaction = configureTransaction(datastore);
	}

	transaction(process: ProcessTransaction) {
		return this.doTransaction(process);
	}
}
