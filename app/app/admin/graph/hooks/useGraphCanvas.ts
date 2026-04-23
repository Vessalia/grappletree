'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const COLORS = {
	background: '#0a0a0a',
	link: '#3a3a3a',
	particle: '#f59e0b',
	label: '#e8e8e8',
	nodeDefault: '#fdfdfd',
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

export function useGraphCanvas(graphData: any) {
	const fgRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const [dimensions, setDimensions] = useState({
		width: 800,
		height: 600,
	});

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
				prev.width === width && prev.height === height
					? prev
					: { width, height }
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

	// Optional: auto-fit once stabilized
	const handleEngineStop = useCallback(() => {
		if (!fgRef.current) return;
		fgRef.current.zoomToFit(400);
	}, []);

	// Custom node rendering
	const drawNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const r = 5;

			// node circle
			ctx.beginPath();
			ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
			ctx.fillStyle = COLORS.nodeDefault;
			ctx.fill();

			// label (zoom-sensitive)
			if (globalScale > 1.5) {
				const fontSize = Math.max(10 / globalScale, 4);

				ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
				ctx.fillStyle = COLORS.label;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';

				ctx.fillText(node.name, node.x, node.y + r + 2);
			}
		},
		[]
	);

	return {
		fgRef,
		containerRef,
		dimensions,
		drawNode,
		handleEngineStop,
		COLORS,
	};
}
