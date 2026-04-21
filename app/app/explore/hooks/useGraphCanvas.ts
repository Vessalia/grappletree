'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { PERSPECTIVE_COLORS } from '@/lib/constants';
import { ExploreSettings } from '@/hooks/useSettings';

type Node = { id: string; name: string; perspective: string };
type Link = { source: string; target: string; name: string; actor: string };

const COLORS = {
	background: '#e8e4db',
	link: '#c4bfb4',
	particle: '#1a1814',
	label: '#1a1814',
	nodeDefault: '#8a8278',
	nodeDimmed: '#c4bfb4',
};

const BASE_GRAPH_CONFIG = {
	nodeRelSize: 6,
	linkWidth: 1,
	cooldownTicks: 100,
	warmupTicks: 100,
	enableNodeDrag: true,
};

type Props = {
	allNodes: Node[];
	allLinks: Link[];
	activePerspectives: Set<string>;
	searchQuery: string;
	settings: ExploreSettings;
	selectedNodeId: string | null;
};

export function useGraphCanvas({
	allNodes,
	allLinks,
	activePerspectives,
	searchQuery,
	settings,
	selectedNodeId,
}: Props) {
	const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({
		nodes: [],
		links: [],
	});

	const containerRef = useRef<HTMLDivElement | null>(null);
	const fgRef = useRef<any>(null);

	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	/* Resize observer */
	useEffect(() => {
		if (!containerRef.current) return;

		const ro = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setDimensions(prev => (prev.width === width && prev.height === height) ? prev : { width, height });
		});

		ro.observe(containerRef.current);

		return () => ro.disconnect();
	}, []);

	/* Build filtered graph */
	useEffect(() => {
		let filteredNodes = allNodes.filter(n => activePerspectives.has(n.perspective));

		if (searchQuery && settings.searchMode === 'filter') {
			const q = searchQuery.toLowerCase();

			const matchingIds = new Set(
				filteredNodes
					.filter(n => n.name.toLowerCase().includes(q))
					.map(n => n.id)
			);

			const neighborIds = new Set<string>();

			allLinks.forEach(l => {
				const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
				const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;

				if (matchingIds.has(srcId)) neighborIds.add(tgtId);
				if (matchingIds.has(tgtId)) neighborIds.add(srcId);
			});

			filteredNodes = filteredNodes.filter(n => matchingIds.has(n.id) || neighborIds.has(n.id));
		}

		const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

		const filteredLinks = allLinks
			.filter(l => {
				const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
				const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;

				return filteredNodeIds.has(srcId) && filteredNodeIds.has(tgtId);
			})
			.map(l => ({ ...l }));

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
			links: filteredLinks,
		});
	}, [
		allNodes,
		allLinks,
		activePerspectives,
		searchQuery,
		settings.searchMode,
	]);

	/* Configure forces once */
	useEffect(() => {
		if (!fgRef.current) return;

		fgRef.current.d3Force('link')?.distance(100);
		fgRef.current.d3Force('charge')?.strength(-150);
	}, []);

	/* Reheat simulation when graph changes */
	useEffect(() => {
		if (!fgRef.current) return;

		fgRef.current.d3ReheatSimulation();
	}, [graphData]);

	/* Engine stop handler */
	const handleEngineStop = useCallback(() => {
		// useful place to hook events like logging or auto-centering
		// fgRef.current?.zoomToFit(400);
	}, []);

	/* Custom node drawing */
	const drawNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const r = 5;

			const isSelected = node.id === selectedNodeId;
			const isMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

			let color = PERSPECTIVE_COLORS[node.perspective] ?? COLORS.nodeDefault;

			if (searchQuery && settings.searchMode === 'highlight' && !isMatch) {
				color = COLORS.nodeDimmed;
			}

			ctx.beginPath();
			ctx.arc(node.x, node.y, isSelected ? r + 2 : r, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();

			if (isSelected) {
				ctx.beginPath();
				ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
				ctx.strokeStyle = color;
				ctx.lineWidth = 1.5 / globalScale;
				ctx.stroke();
			}

			if (globalScale > settings.labelZoomThreshold) {
				const fontSize = Math.max(10 / globalScale, 4);

				ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
				ctx.fillStyle = COLORS.label;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';

				ctx.fillText(node.name, node.x, node.y + r + 2);
			}
		},
		[
			selectedNodeId,
			searchQuery,
			settings.searchMode,
			settings.labelZoomThreshold,
		]
	);

	return {
		fgRef,
		containerRef,
		graphData,
		dimensions,
		handleEngineStop,
		drawNode,
		COLORS,
		BASE_GRAPH_CONFIG,
	};
}
