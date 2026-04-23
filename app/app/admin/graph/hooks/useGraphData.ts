'use client';
import { useEffect, useState } from 'react';

export type Node = { id: string; name: string; contextIds: string[] };
export type Link = {
	source: string;
	target: string;
	name: string;
	startActor: string;
	resultActor: string;
	contextIds: string[];
};
export type ContextNode = { id: string; name: string };

export function useGraphData() {
	const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({
		nodes: [],
		links: [],
	});
	const [contextNodes, setContextNodes] = useState<ContextNode[]>([]);

	useEffect(() => {
		async function fetchGraph() {
			const [pRes, tRes, cRes] = await Promise.all([
				fetch('/api/positions'),
				fetch('/api/techniques'),
				fetch('/api/contexts'),
			]);
			const [positions, techniques, contexts] = await Promise.all([
				pRes.json(),
				tRes.json(),
				cRes.json(),
			]);

			const nodes: Node[] = positions.map((p: any) => ({
				id: p.id,
				name: p.name,
				contextIds: (p.contexts ?? [])
					.filter((c: any) => c.name != null)
					.map((c: any) => c.id),
			}));

			const links: Link[] = techniques.map((t: any) => ({
				source: t.fromId,
				target: t.toId,
				name: t.name,
				startActor: t.startActor,
				resultActor: t.resultActor,
				contextIds: (t.contexts ?? [])
					.filter((c: any) => c.name != null)
					.map((c: any) => c.id),
			}));

			const ctxNodes: ContextNode[] = contexts.map((c: any) => ({
				id: c.id,
				name: c.name,
			}));

			setGraphData({ nodes, links });
			setContextNodes(ctxNodes);
		}
		fetchGraph();
	}, []);

	return { graphData, contextNodes };
}