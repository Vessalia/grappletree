'use client';

import { useEffect, useState } from 'react';

type Node = { id: string; name: string };
type Link = {
	source: string;
	target: string;
	name: string;
	startActor: string;
	resultActor: string;
};

export function useGraphData() {
	const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({
		nodes: [],
		links: [],
	});

	useEffect(() => {
		async function fetchGraph() {
			const [pRes, tRes] = await Promise.all([
				fetch('/api/positions'),
				fetch('/api/techniques'),
			]);

			const [positions, techniques] = await Promise.all([
				pRes.json(),
				tRes.json(),
			]);

			const nodes: Node[] = positions.map((p: any) => ({
				id: p.id,
				name: p.name,
			}));

			const links: Link[] = techniques.map((t: any) => ({
				source: t.fromId,
				target: t.toId,
				name: t.name,
				startActor: t.startActor,
				resultActor: t.resultActor,
			}));

			setGraphData({ nodes, links });
		}

		fetchGraph();
	}, []);

	return {
		graphData,
	};
}
