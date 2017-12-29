
export const log = (mode: 'state' | 'context' | 'all' = 'all', map?: (x: any) => any) => (state, context) => {

	switch (mode) {
		case 'state':
			console.log('STATE', map ? map(state) : state)
			break

		case 'context':
			console.log('CONTEXT', map ? map(context) : context)
			break

		case 'all':
			console.log('STATE', state, 'CONTEXT', context)
			break
	}

	return state
}
