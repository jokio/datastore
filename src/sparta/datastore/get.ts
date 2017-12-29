
export const ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND'

export const get = (props: GetProps) => async (state, context) => {

	const { datastore: db, kind: contextKind } = context;
	const { kind, id } = props;

	const key = db.key([contextKind || kind, id])
	const [serverState]: [any] = await db.get(key)
	if (!serverState)
		throw new Error(ENTITY_NOT_FOUND)

	return serverState
}


export interface GetProps {
	kind?: string
	id: any
}
