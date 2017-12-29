import * as Datastore from '@google-cloud/datastore';


export const configure = (props: ConfigureProps = {}) => (state, context) => {

	const { credentials, datastore, kind } = props

	const checked = x => (typeof credentials === 'string')
		? JSON.parse(x)
		: x

	context.datastore = datastore || context.datastore || new Datastore({ credentials: checked(credentials) })
	context.kind = kind || context.kind;

	return state
}


export interface ConfigureProps {
	credentials?: string | JSON
	datastore?: Datastore
	kind?: string
}
