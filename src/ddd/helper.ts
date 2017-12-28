
// function compose({args, funcs}) {
// 	if (funcs.length === 0) {
// 		return arg => arg
// 	}

// 	if (funcs.length === 1) {
// 		return funcs[0]
// 	}

// 	return funcs.reduce((a, b) => async (...args) => b(await a(...args, ctx)))
// }
