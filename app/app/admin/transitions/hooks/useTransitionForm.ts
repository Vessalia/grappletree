import { useState } from 'react';
import { useForm } from 'react-hook-form';

type Context = {
	discipline: string;
	effectiveness: string;
};

type FormData = {
	name: string;
	fromId: string;
	toId: string;
	actor: string;
	notes: string;
};

type Transition = {
	id: string;
};

export function useTransitionForm(fetchAll: () => Promise<void>) {
	const [loading, setLoading] = useState(false);
	const [contexts, setContexts] = useState<Context[]>([]);

	const {
		register,
		handleSubmit,
		reset,
		setValue
	} = useForm<FormData>({
		defaultValues: {
			name: '',
			fromId: '',
			toId: '',
			actor: 'either',
			notes: ''
		}
	});

	function addContext() {
		setContexts(prev => [
			...prev,
			{ discipline: 'bjj', effectiveness: 'core' }
		]);
	}

	function removeContext(i: number) {
		setContexts(prev =>
			prev.filter((_, idx) => idx !== i)
		);
	}

	function updateContext(
		i: number,
		field: keyof Context,
		value: string
	) {
		setContexts(prev =>
			prev.map((ctx, idx) =>
				idx === i ? { ...ctx, [field]: value } : ctx
			)
		);
	}

	async function submit(data: FormData, selected: Transition | null) {
		setLoading(true);
		try {
			if (selected) {
				await fetch(`/api/transitions/${selected.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...data, contexts })
				});
			} else {
				await fetch('/api/transitions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...data, contexts })
				});
			}

			await fetchAll();

			reset();
			setContexts([]);

		} finally {
			setLoading(false);
		}
	}

	return {
		register,
		handleSubmit,
		reset,
		setValue,
		contexts,
		addContext,
		removeContext,
		updateContext,
		loading,
		submit
	};
}
