import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DISCIPLINES, ACTORS } from '@/lib/constants';
import { Context, Technique } from './useTechniques';

type FormData = {
	name: string;
	fromId: string;
	toId: string;
	startActor: string;
	resultActor: string;
	notes: string;
};

export function useTechniqueForm(fetchAll: () => Promise<void>) {
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
			startActor: ACTORS[0],
			resultActor: ACTORS[0],
			notes: ''
		}
	});

	function addContext() {
		setContexts(prev => [
			...prev,
			{ name: DISCIPLINES[0], effectiveness: 'core' }
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

	async function submit(data: FormData, selected: Technique | null) {
		setLoading(true);
		try {
			const payload = {
				...data,
				contexts
			};

			if (selected) {
				await fetch(`/api/techniques/${selected.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				await fetch('/api/techniques', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
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
		setContexts,
		addContext,
		removeContext,
		updateContext,
		loading,
		submit
	};
}
