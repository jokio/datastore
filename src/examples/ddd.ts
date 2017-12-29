import { run, RunProps, compose, log, datastore, timer } from '../sparta';
import * as customer from './customer'

// customer.RegisteredEvent.attach(x => {
// 	console.log('CREATED', x.data)
// })


const props: RunProps = {
	showTime: true,
	errorFn: err => console.log(err)
};


run(props,
	datastore.configure({ kind: 'Customers' }),
	datastore.get({ id: '9ac70bc800e345af834435adb92a734d' }),
	customer.register({ name: 'Ezekia' }),
	datastore.save({ useTransaction: false }),
);
