'use client';

import dynamic from 'next/dynamic';
import { useGraphCanvas } from '../hooks/useGraphCanvas';
import { PERSPECTIVE_COLORS } from '@/lib/constants';
import { ExploreSettings } from '@/hooks/useSettings';

const ForceGraph = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Node = { id: string; name: string; perspective: string; };
type Link = { source: string; target: string; name: string; actor: string; };

type Props = {
	allNodes: Node[];
	allLinks: Link[];
	activePerspectives: Set<string>;
	searchQuery: string;
	settings: ExploreSettings;
	onNodeClick: (node: Node) => void;
	selectedNodeId: string | null;
};

export default function GraphCanvas(props: Props) {
	const {
		fgRef, containerRef, graphData, dimensions,
		handleEngineStop, drawNode, COLORS, BASE_GRAPH_CONFIG,
	} = useGraphCanvas(props);

	return (
		<div ref={containerRef} style={{ width: '100%', height: '100%' }}>
			<ForceGraph
				ref={fgRef}
				width={dimensions.width}
				height={dimensions.height}
				graphData={graphData}
				backgroundColor={COLORS.background}
				{...BASE_GRAPH_CONFIG}
				linkColor={() => COLORS.link}
				linkLabel={(link: any) => `${link.name} (${link.actor})`}
				linkDirectionalArrowLength={props.settings.showArrows ? 4 : 0}
				linkDirectionalArrowRelPos={1}
				linkDirectionalParticles={1}
				linkDirectionalParticleSpeed={0.004}
				linkDirectionalParticleColor={() => COLORS.particle}
				nodeLabel={(node: any) => `${node.name} (${node.perspective})`}
				nodeColor={(node: any) => PERSPECTIVE_COLORS[node.perspective] ?? COLORS.nodeDefault}
				nodeCanvasObject={drawNode}
				onNodeClick={(node: any) => props.onNodeClick(node)}
				onEngineStop={handleEngineStop}
			/>
		</div>
	);
}
