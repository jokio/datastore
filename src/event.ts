
export type EventAction<TData> = (data: TData) => Promise<void>;

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

	post(eventData) {
		if (!this.actions.length) return;

		const promises = this.actions.map(x => x(eventData));
		return Promise.all(promises)
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

