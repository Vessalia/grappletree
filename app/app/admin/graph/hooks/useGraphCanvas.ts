'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { DisplayMode } from './useGraphFilters';

const COLORS = {
	background: '#0a0a0a',
	link: '#3a3a3a',
	linkDim: '#1e1e1e',
	particle: '#f59e0b',
	label: '#e8e8e8',
	nodeDefault: '#fdfdfd',
	nodeDim: '#2a2a2a',
};

export const GRAPH_CONFIG = {
	backgroundColor: COLORS.background,
	nodeRelSize: 6,
	linkWidth: 1.5,
	linkCurvature: 0.2,
	linkDirectionalArrowLength: 4,
	linkDirectionalArrowRelPos: 1,
	linkDirectionalParticles: 1,
	linkDirectionalParticleSpeed: 0.004,
	cooldownTicks: 100,
	warmupTicks: 100,
	enableNodeDrag: true,
};

export function useGraphCanvas(
	graphData: any,
	visibleNodeIds: Set<string> | null,
	visibleLinkIds: Set<number> | null,
	displayMode: DisplayMode
) {
	const fgRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Keep a stable ref to link index for visibility lookups
	const linkIndexRef = useRef<Map<any, number>>(new Map());
	useEffect(() => {
		const map = new Map<any, number>();
		graphData.links.forEach((l: any, i: number) => map.set(l, i));
		linkIndexRef.current = map;
	}, [graphData.links]);

	function assignCurvatures(links: any[]) {
		const pairSet = new Set<string>();
		for (const link of links) {
			const src = link.source?.id ?? link.source;
			const tgt = link.target?.id ?? link.target;
			const forward = `${src}->${tgt}`;
			const reverse = `${tgt}->${src}`;
			if (pairSet.has(reverse)) {
				const reverseLink = links.find(l => {
					const ls = l.source?.id ?? l.source;
					const lt = l.target?.id ?? l.target;
					return `${ls}->${lt}` === reverse;
				});
				if (reverseLink) reverseLink.curvature = GRAPH_CONFIG.linkCurvature;
				link.curvature = GRAPH_CONFIG.linkCurvature;
			} else {
				pairSet.add(forward);
				link.curvature = 0;
			}
		}
		return links;
	}

	// Resize handling
	useEffect(() => {
		if (!containerRef.current) return;
		const ro = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setDimensions(prev =>
				prev.width === width && prev.height === height ? prev : { width, height }
			);
		});
		ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, []);

	// Force tuning
	useEffect(() => {
		if (!fgRef.current) return;
		fgRef.current.d3Force('link')?.distance(90);
		fgRef.current.d3Force('charge')?.strength(-120);
	}, []);

	// Reheat simulation when data changes
	useEffect(() => {
		if (!fgRef.current) return;
		assignCurvatures(graphData.links);
		fgRef.current.d3ReheatSimulation();
	}, [graphData]);

	const handleEngineStop = useCallback(() => {
		if (!fgRef.current) return;
		fgRef.current.zoomToFit(400);
	}, []);

	// Node visibility helper
	const isNodeVisible = useCallback(
		(nodeId: string) => visibleNodeIds === null || visibleNodeIds.has(nodeId),
		[visibleNodeIds]
	);

	// Custom node rendering — respects filter state
	const drawNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const visible = isNodeVisible(node.id);
			const dimmed = !visible && displayMode === 'dim';

			if (!visible && displayMode === 'hide') return;

			const r = 5;
			ctx.beginPath();
			ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
			ctx.fillStyle = dimmed ? COLORS.nodeDim : COLORS.nodeDefault;
			ctx.globalAlpha = dimmed ? 0.25 : 1;
			ctx.fill();
			ctx.globalAlpha = 1;

			if (globalScale > 1.5 && !dimmed) {
				const fontSize = Math.max(10 / globalScale, 4);
				ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
				ctx.fillStyle = COLORS.label;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(node.name, node.x, node.y + r + 2);
			}
		},
		[isNodeVisible, displayMode]
	);

	// Link color — respects filter state
	const getLinkColor = useCallback(
		(link: any) => {
			if (visibleLinkIds === null) return COLORS.link;
			const idx = linkIndexRef.current.get(link);
			const visible = idx !== undefined && visibleLinkIds.has(idx);
			if (visible) return COLORS.link;
			return displayMode === 'dim' ? COLORS.linkDim : 'transparent';
		},
		[visibleLinkIds, displayMode]
	);

	// Link visibility for particles — only show on visible links
	const getLinkParticleColor = useCallback(
		(link: any) => {
			if (visibleLinkIds === null) return COLORS.particle;
			const idx = linkIndexRef.current.get(link);
			const visible = idx !== undefined && visibleLinkIds.has(idx);
			return visible ? COLORS.particle : 'transparent';
		},
		[visibleLinkIds]
	);

	return {
		fgRef,
		containerRef,
		dimensions,
		drawNode,
		handleEngineStop,
		getLinkColor,
		getLinkParticleColor,
		COLORS,
	};
}