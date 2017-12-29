import { run, RunProps, compose, log, datastore, timer } from '../sparta';
import * as customer from './customer'
import { Entity } from '../index';

customer.RegisteredEvent.attach(x => {
	console.log('CREATED', x.data)
})


const props: RunProps = {
	showTime: true,
	errorFn: err => console.log(err)
};



const process = compose(
	datastore.get({ id: '9ac70bc800e345af834435adb92a734d' }),
	customer.register({ name: 'Ezekia' }),
	datastore.save({ useTransaction: false }),
)


run(props,
	(state, context) => {
		context.ez = 1;
		return state
	},
	log('context'),
	// process,
);

