
// This is THE Function, this is whole framework, everything is built on that, this, is, sparta!! (kick)
export const compose = (...functions) =>
	(functions.length === 0)
		? arg => arg
		: functions.reduce(
			(a, b) => async (...args) => b(await a(...args), {}),
			arg => Promise.resolve({}) // initial value, need for context, also to work on one item
		)
