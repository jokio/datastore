/// <reference types="@google-cloud/datastore" />

import * as GoogleDatastore from '@google-cloud/datastore'

export * from './types'
export * from './db-transaction'
export * from './db-set-base'
export * from './db-set'
export * from './db-context'
export * from './db-aggregate'
export const Datastore = GoogleDatastore;
