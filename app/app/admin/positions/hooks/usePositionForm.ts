import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DISCIPLINES } from '@/lib/constants';
import { Context } from './usePositions';

type FormData = {
	name: string;
	notes: string;
};

export function usePositionForm(fetchPositions: () => Promise<void>) {
	const [loading, setLoading] = useState(false);
	const [contexts, setContexts] = useState<Context[]>([]);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control
	} = useForm<FormData>({
		defaultValues: {
			name: '',
			notes: ''
		}
	});

	function addContext() {
		setContexts(prev => [
			...prev,
			{ discipline: DISCIPLINES[0], effectiveness: 'core' }
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

	async function submit(
		data: FormData,
		selected: any
	) {
		setLoading(true);
		try {
			const payload = {
				...data,
				contexts
			};

			if (selected) {
				await fetch(`/api/positions/${selected.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				await fetch('/api/positions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			await fetchPositions();

			reset();
			setContexts([]);
		} finally {
			setLoading(false);
		}
	}

	return {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		contexts,
		setContexts,
		addContext,
		removeContext,
		updateContext,
		loading,
		submit
	};
}
