import { useEffect, useState } from 'react';

export type Position = {
	id: string;
	name: string;
	perspective: string;
};

export type Context = {
	discipline: string;
	effectiveness: string;
};

export type Transition = {
	id: string;
	name: string;
	actor: string;
	notes: string;
	fromId: string;
	toId: string;
	contexts: Context[];
};

export function useTransitions() {
	const [transitions, setTransitions] = useState<Transition[]>([]);
	const [positions, setPositions] = useState<Position[]>([]);

	async function fetchAll() {
		const [tRes, pRes] = await Promise.all([
			fetch('/api/transitions'),
			fetch('/api/positions')
		]);

		const [tData, pData] = await Promise.all([
			tRes.json(),
			pRes.json()
		]);

		setTransitions(tData);
		setPositions(pData);
	}

	async function deleteTransition(id: string) {
		if (!confirm('Delete this transition?')) return;
		await fetch(`/api/transitions/${id}`, { method: 'DELETE' });
		await fetchAll();
	}

	useEffect(() => {
		fetchAll();
	}, []);

	return {
		transitions,
		positions,
		fetchAll,
		deleteTransition
	};
}
