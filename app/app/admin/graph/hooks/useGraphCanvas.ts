'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PERSPECTIVE_COLORS } from '@/lib/constants';

const COLORS = {
	background: '#0a0a0a',
	link: '#3a3a3a',
	particle: '#f59e0b',
	label: '#e8e8e8',
	nodeDefault: '#888888',
};

export const GRAPH_CONFIG = {
	backgroundColor: COLORS.background,
	nodeRelSize: 6,
	linkWidth: 1.5,
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

	useEffect(() => {
		if (!fgRef.current) return;

		fgRef.current.d3Force('link')?.distance(80);
		fgRef.current.d3Force('charge')?.strength(-100);
	}, []);

	useEffect(() => {
		if (!fgRef.current) return;

		fgRef.current.d3ReheatSimulation();
	}, [graphData]);

	const handleEngineStop = useCallback(() => {
		// useful for zoomToFit if desired
	}, []);

	const drawNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const r = 5;

			ctx.beginPath();
			ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);

			ctx.fillStyle =
				PERSPECTIVE_COLORS[node.perspective] ?? COLORS.nodeDefault;

			ctx.fill();

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
