import { compose } from './compose'

export const run = async (...functions) => await compose(...functions)()
