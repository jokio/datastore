import { AggregateRootResolver, Datastore, uniqueId } from "../index";
import { AccountAggregate, CustomerAggregate, OperationsAggregate } from "./domain";
import { setTimeout } from "timers";

const credentials = undefined;
const db = new Datastore({ credentials });
const id = uniqueId();
const key = db.key(['Customers', '14d2ea8325bd4254aa8425e30b457893']);


async function run(instance) {

	const [oldData]: [any] = await db.get(key);


	console.log(instance, 'old data', oldData.version);
	setTimeout(async () => {
		try {
			// tran
			const tran = db.transaction();
			await watchTime('Start tran', async () => await tran.run())

			if (oldData.version) {
				const [item]: [any] = await tran.get(key);
				// console.log(instance, 'check data', item.version);

				if (oldData.version != item.version) {
					console.log(instance, 'VERSION_CHANGED');
					await tran.rollback();
					return
				}
			}
			oldData.version = uniqueId();

			tran.save({ key, data: oldData });
			const commitResult = await tran.commit();
		}
		catch (err) {
			console.log(instance, err.message)
		}
	}, 1000)

	// console.log(2, c2)



	// setTimeout(async () => {
	// 	await watchTime('Commit', async () => await tran.commit())


	// 	await watchTime('Get from db2', async () => {
	// 		const [c3] = await db.get(key);
	// 		console.log(c3)
	// 	})
	// }, 4000)

	// await watchTime('Get from db', async () => {
	// 	const [c3] = await tran.get(key);
	// 	console.log(c3)
	// })


}

const watchTime = async (prefix, action) => {
	const startTime = Date.now();
	await action();
	console.log(prefix, ' - ', Date.now() - startTime);
}

run(1);
run(2);
run(3);
run(4);
run(5);
run(6);
run(7);
run(8);
