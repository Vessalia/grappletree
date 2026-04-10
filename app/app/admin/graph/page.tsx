'use client';

import dynamic from 'next/dynamic';
import { PERSPECTIVES, PERSPECTIVE_COLORS } from '@/lib/constants';

import { useGraphData } from './hooks/useGraphData';
import { useGraphCanvas, GRAPH_CONFIG } from './hooks/useGraphCanvas';

const ForceGraph = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphPage() {
	const { graphData, activeFilters, toggleFilter } = useGraphData();

	const {
		fgRef,
		containerRef,
		dimensions,
		drawNode,
		handleEngineStop,
		COLORS,
	} = useGraphCanvas(graphData);

	return (
		<div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
			<div className="graph-toolbar">
				<span className="graph-toolbar-label">perspective</span>

				{PERSPECTIVES.map(p => (
					<button
						key={p}
						onClick={() => toggleFilter(p)}
						className="graph-filter-btn"
						style={{
							borderColor: activeFilters.has(p)
								? PERSPECTIVE_COLORS[p]
								: '#2a2a2a',
							color: activeFilters.has(p)
								? PERSPECTIVE_COLORS[p]
								: '#444444',
						}}
					>
						{p}
					</button>
				))}

				<span className="graph-toolbar-count">
					{graphData.nodes.length} nodes · {graphData.links.length} edges
				</span>
			</div>

			<div ref={containerRef} className="graph-container">
				<ForceGraph
					ref={fgRef}
					width={dimensions.width}
					height={dimensions.height}
					graphData={graphData}
					{...GRAPH_CONFIG}
					linkColor={() => COLORS.link}
					linkLabel={(link: any) => `${link.name} (${link.actor})`}
					linkDirectionalParticleColor={() => COLORS.particle}
					nodeLabel={(node: any) => `${node.name} (${node.perspective})`}
					nodeCanvasObject={drawNode}
					onEngineStop={handleEngineStop}
				/>
			</div>
		</div>
	);
}
