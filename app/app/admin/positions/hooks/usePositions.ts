import { useEffect, useState } from 'react';
import { Context } from '../../techniques/hooks/useTechniques';
export type { Context } from '../../techniques/hooks/useTechniques';

export type Position = {
	id: string;
	name: string;
	notes: string;
	contexts?: Context[];
};

export function usePositions() {
	const [positions, setPositions] = useState<Position[]>([]);
	async function fetchPositions() {
		const res = await fetch('/api/positions');
		setPositions(await res.json());
	}

	async function deletePosition(id: string) {
		if (!confirm('Delete this position? All connected techniques will also be deleted.')) {
			return;
		}
		await fetch(`/api/positions/${id}`, { method: 'DELETE' });
		await fetchPositions();
	}

	useEffect(() => {
		fetchPositions();
	}, []);

	return {
		positions,
		fetchPositions,
		deletePosition
	};
}
