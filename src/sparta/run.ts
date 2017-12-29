import { compose, ComposeFunction } from './compose'

export const run = async <TState>(props: RunProps, ...functions: ComposeFunction<TState>[]) => {
	props = props || {};

	const { errorFn, showTime } = props;
	const startTime = Date.now()

	try {
		await compose(...functions)({})
	}
	catch (err) {
		if (errorFn)
			await errorFn(err);
	}
	finally {
		if (showTime)
			console.log(Date.now() - startTime)
	}
}

export interface RunProps {
	errorFn?: (err) => Promise<void> | void
	showTime?: boolean
}
