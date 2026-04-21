import { useEffect, useState } from 'react';

type Position = {
	id: string;
	name: string;
	perspective: string;
	notes: string;
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
