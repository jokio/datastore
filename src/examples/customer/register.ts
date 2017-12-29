import { uniqueId } from "../../sparta/uniqueId"
import { DomainEvent } from "../../index"
import * as operations from './aggregates/operations'


export const RegisteredEvent = new DomainEvent<RegisteredEvent>()

export const register = (props: RegisterProps) => async (_, context) => {

	const defaultProps = {
		id: uniqueId(),
		accountsCount: 0,
		operations: operations.defaultState,
	}

	const state = {
		...defaultProps,
		...props,
	}

	const eventData = {
		id: state.id,
		name: state.name,
		accountsCount: state.accountsCount,
	}

	await RegisteredEvent.post(eventData, context)

	return state
}


// types
export interface RegisterProps {
	name: string
}

export interface RegisteredEvent {
	id: string
	name: string
	accountsCount: number
}
