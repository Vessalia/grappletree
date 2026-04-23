import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
	name: string;
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
			notes: ''
		}
	});

	async function submit(
		data: FormData,
		selected: any
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
