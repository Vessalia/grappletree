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

export type Technique = {
	id: string;
	name: string;
	notes: string;
	fromId: string;
	toId: string;
	startActor: string;
	resultActor: string;
	contexts?: Context[];
};

export function useTechniques() {
	const [techniques, setTechniques] = useState<Technique[]>([]);
	const [positions, setPositions] = useState<Position[]>([]);

	async function fetchAll() {
		const [tRes, pRes] = await Promise.all([
			fetch('/api/techniques'),
			fetch('/api/positions')
		]);

		const [tData, pData] = await Promise.all([
			tRes.json(),
			pRes.json()
		]);

		setTechniques(tData);
		setPositions(pData);
	}

	async function deleteTechnique(id: string) {
		if (!confirm('Delete this technique?')) return;
		await fetch(`/api/techniques/${id}`, { method: 'DELETE' });
		await fetchAll();
	}

	useEffect(() => {
		fetchAll();
	}, []);

	return {
		techniques,
		positions,
		fetchAll,
		deleteTechnique
	};
}
