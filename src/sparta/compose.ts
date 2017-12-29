
export const STATE_UNDEFINED = 'STATE_UNDEFINED'

// This is THE Function, this is whole framework, everything is built on that, this, is, sparta!! (kick)
export const compose = <TState>(...functions: ComposeFunction<TState>[]) => {
	const context = {}

	return (functions.length === 0)
		? arg => arg
		: functions.reduce(
			// async function inside reducer ^^
			(a, b) => async (...args) => {
				const state: TState = await a(...args)
				if (!state)
					throw Error(STATE_UNDEFINED)

				return b(state, context)
			},
			(arg: TState) => Promise.resolve<TState>(arg || <TState>{})
		)
}

export type ComposeFunction<TState> = (state?: TState, context?) => Promise<TState> | TState;
