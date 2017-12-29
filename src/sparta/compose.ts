
export const STATE_UNDEFINED = 'STATE_UNDEFINED'

// This is THE Function, this is whole framework, everything is built on that, this, is, sparta!! (kick)
export const compose = <TState>(...functions: ComposeFunction<TState>[]) => {

	let context = {};

	const initialValueFn: ComposeFunction<TState> = (arg: TState, initialContext?: any) => {
		context = initialContext || {}
		return Promise.resolve<TState>(arg || <TState>{})
	}

	const reducerFn = (a: ComposeFunction<TState>, b: ComposeFunction<TState>) => async (...args) => {
		const state: TState = await a(...args)
		if (!state)
			throw Error(STATE_UNDEFINED)

		return b(state, context)
	}


	return (functions.length === 0)
		? (arg, t) => arg
		: functions.reduce(
			reducerFn,
			initialValueFn
		)
}

export type ComposeFunction<TState> = (state?: TState, context?) => Promise<TState> | TState;
