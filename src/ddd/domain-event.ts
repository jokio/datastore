import { Event } from '../event';

export class DomainEvent<TData> extends Event<DomainEventData<TData>> { }

export interface DomainEventData<TData> {
	dbContext: any
	data: TData
}
