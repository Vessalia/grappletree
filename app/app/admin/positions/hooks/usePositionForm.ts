import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OPPOSING_PERSPECTIVES } from '@/lib/constants';

type FormData = {
	name: string;
	perspective: string;
	notes: string;
};

export function usePositionForm(fetchPositions: () => Promise<void>) {
	const [loading, setLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control
	} = useForm<FormData>({
		defaultValues: {
			name: '',
			perspective: 'neutral',
			notes: ''
		}
	});

	async function submit(
		data: FormData,
		selected: any,
		createReciprocal: boolean
	) {
		setLoading(true);
		try {
			if (selected) {
				await fetch(`/api/positions/${selected.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data)
				});
			} else {
				await fetch('/api/positions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data)
				});

				if (
					createReciprocal &&
					OPPOSING_PERSPECTIVES[data.perspective]
				) {
					await fetch('/api/positions', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							name: data.name,
							perspective: OPPOSING_PERSPECTIVES[data.perspective],
							notes: data.notes
						})
					});
				}
			}

			await fetchPositions();
			reset();
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
		loading,
		submit
	};
}
