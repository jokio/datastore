
export type EventAction<TData> = (data: TData) => Promise<void>;

export class Event<TData>  {
	private actions: EventAction<TData>[] = [];

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

	async post(event): Promise<void> {
		await Promise.all(this.actions)
	}

	attach(action: EventAction<TData>) {
		this.actions.push(this.handleError(action, false));
	}

	attachSafe(action: EventAction<TData>) {
		this.actions.push(this.handleError(action, true));
	}
}

