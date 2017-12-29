
export type EventAction<TEventData> = (event: TEventData) => Promise<void> | void;

export class Event<TData>  {
	private actions: EventAction<TData>[] = [];
	private mappings: any[] = [];

	private handleError = (action: EventAction<TData>, catchError) => async (data: TData) => {
		try {
			await action(data);
		}
		catch (err) {
			if (catchError)
				console.warn(err);
			else
				throw err;
		}
	}

	protected async publish(eventData) {
		if (!this.actions.length) return;

		for (let i = 0; i < this.actions.length; i++) {
			await this.actions[i](eventData);
		}
	}

	attach(action: EventAction<TData>) {
		const withErrorHandling = this.handleError(action, false);

		this.mappings.push({ action, withErrorHandling });
		this.actions.push(withErrorHandling);
	}

	attachSafe(action: EventAction<TData>) {
		const withErrorHandling = this.handleError(action, true);

		this.mappings.push({ action, withErrorHandling });
		this.actions.push(withErrorHandling);
	}

	detach(action: EventAction<TData>) {
		const withErrorHandling = this.mappings.filter(x => x.action === action)[0];
		if (!withErrorHandling) return;

		const index = this.actions.indexOf(withErrorHandling);
		if (index > -1)
			this.actions.splice(index, 1);
	}
}

