import * as uuid from 'uuid';

export const uniqueId = (): string => uuid.v4().toString().replace(/-/g, '')
