import { run, RunProps, compose, log, datastore } from '../sparta';
import * as customer from './customer'

// customer.RegisteredEvent.attach(x => {
// 	console.log('CREATED', x.data)
// })


const props: RunProps = {
	showTime: true,
	errorFn: err => console.log(err)
};


run(props,
	timer(),
	datastore.configure({ kind: 'Customers' }),
	timer(0),
	datastore.get({ id: '9ac70bc800e345af834435adb92a734d' }),
	timer(1),
	customer.register({ name: 'Ezekia' }),
	timer(2),
	datastore.save({ useTransaction: false }),
	timer(3),
);
