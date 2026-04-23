'use client';

import dynamic from 'next/dynamic';

import { useGraphData } from './hooks/useGraphData';
import { useGraphCanvas, GRAPH_CONFIG } from './hooks/useGraphCanvas';

const ForceGraph = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphPage() {
	const { graphData } = useGraphData();

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
				<span className="graph-toolbar-label">transitions</span>

				<span className="graph-toolbar-count">
					{graphData.nodes.length} nodes · {graphData.links.length} edges
				</span>
			</div>

			<div ref={containerRef} className="graph-container">
				<ForceGraph
					ref={fgRef}
					width={dimensions.width}
					height={dimensions.height}
					{...GRAPH_CONFIG}
					linkCurvature="curvature"
					graphData={graphData}
					linkColor={() => COLORS.link}
					linkLabel={(link: any) =>
						`${link.name} (${link.startActor} → ${link.resultActor})`
					}
					linkDirectionalParticleColor={() => COLORS.particle}
					nodeLabel={(node: any) => node.name}
					nodeCanvasObject={drawNode}
					onEngineStop={handleEngineStop}
				/>
			</div>
		</div>
	);
}
