'use client';

import { useEffect, useState } from 'react';
import { PERSPECTIVES } from '@/lib/constants';

type Node = { id: string; name: string; perspective: string };
type Link = { source: string; target: string; name: string; actor: string };

export function useGraphData() {
	const [allNodes, setAllNodes] = useState<Node[]>([]);
	const [allLinks, setAllLinks] = useState<Link[]>([]);
	const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(PERSPECTIVES));

	const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({
		nodes: [],
		links: [],
	});

	useEffect(() => {
		async function fetchGraph() {
			const [pRes, tRes] = await Promise.all([
				fetch('/api/positions'),
				fetch('/api/transitions'),
			]);

			const [positions, transitions] = await Promise.all([
				pRes.json(),
				tRes.json(),
			]);

			setAllNodes(
				positions.map((p: any) => ({
					id: p.id,
					name: p.name,
					perspective: p.perspective,
				}))
			);

			setAllLinks(
				transitions.map((t: any) => ({
					source: t.fromId,
					target: t.toId,
					name: t.name,
					actor: t.actor,
				}))
			);
		}

		fetchGraph();
	}, []);

	useEffect(() => {
		const filteredNodes = allNodes.filter(n =>
			activeFilters.has(n.perspective)
		);

		const nodeIds = new Set(filteredNodes.map(n => n.id));

		const filteredLinks = allLinks.filter(l => {
			const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
			const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
			return nodeIds.has(s) && nodeIds.has(t);
		});

		const freshNodes = filteredNodes.map(n => ({
			...n,
			x: undefined,
			y: undefined,
			vx: undefined,
			vy: undefined,
			fx: undefined,
			fy: undefined,
		}));

		setGraphData({
			nodes: freshNodes,
			links: filteredLinks.map(l => ({ ...l })),
		});
	}, [allNodes, allLinks, activeFilters]);

	function toggleFilter(p: string) {
		setActiveFilters(prev => {
			const next = new Set(prev);
			next.has(p) ? next.delete(p) : next.add(p);
			return next;
		});
	}

	return {
		graphData,
		activeFilters,
		toggleFilter,
	};
}
