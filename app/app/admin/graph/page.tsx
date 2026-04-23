'use client';
import dynamic from 'next/dynamic';
import { useGraphData } from './hooks/useGraphData';
import { useGraphCanvas, GRAPH_CONFIG } from './hooks/useGraphCanvas';
import { useGraphFilters } from './hooks/useGraphFilters';

const ForceGraph = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphPage() {
	const { graphData, contextNodes } = useGraphData();
	const {
		coreContexts,
		extraContexts,
		activeContextIds,
		filterMode,
		displayMode,
		visibleNodeIds,
		visibleLinkIds,
		toggleContext,
		clearFilters,
		setFilterMode,
		setDisplayMode,
		getContextColor,
	} = useGraphFilters(graphData, contextNodes);

	const {
		fgRef,
		containerRef,
		dimensions,
		drawNode,
		handleEngineStop,
		getLinkColor,
		getLinkParticleColor,
	} = useGraphCanvas(graphData, visibleNodeIds, visibleLinkIds, displayMode);

	const hasFilters = activeContextIds.size > 0;

	const pillStyle = (id: string, name: string, active: boolean): React.CSSProperties => {
		if (!active) return {};
		const color = getContextColor(name);
		return {
			borderColor: color,
			color,
			background: `${color}12`,
		};
	};

	return (
		<div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
			<div className="graph-toolbar">
				{/* Left: title + counts */}
				<div className="graph-toolbar-left">
					<span className="graph-toolbar-label">transitions</span>
					<span className="graph-toolbar-count">
						{graphData.nodes.length} nodes · {graphData.links.length} edges
					</span>
				</div>

				<span className="graph-filter-divider" aria-hidden="true" />

				{/* Center: context filter pills */}
				<div className="graph-filter-pills">
					{/* Core 4 */}
					{coreContexts.map(ctx => {
						const active = activeContextIds.has(ctx.id);
						return (
							<button
								key={ctx.id}
								className={`graph-filter-pill graph-filter-pill--core${active ? ' graph-filter-pill--active' : ''}`}
								style={pillStyle(ctx.id, ctx.name, active)}
								onClick={() => toggleContext(ctx.id)}
							>
								{ctx.name}
							</button>
						);
					})}

					{/* Divider — only shown when extra contexts exist */}
					{extraContexts.length > 0 && (
						<span className="graph-filter-divider" aria-hidden="true" />
					)}

					{/* Extra contexts inferred from API */}
					{extraContexts.map(ctx => {
						const active = activeContextIds.has(ctx.id);
						return (
							<button
								key={ctx.id}
								className={`graph-filter-pill graph-filter-pill--extra${active ? ' graph-filter-pill--active' : ''}`}
								style={pillStyle(ctx.id, ctx.name, active)}
								onClick={() => toggleContext(ctx.id)}
							>
								{ctx.name}
							</button>
						);
					})}

					{/* Clear */}
					{hasFilters && (
						<button
							className="graph-filter-clear"
							onClick={clearFilters}
							title="Clear all filters"
						>
							✕
						</button>
					)}
				</div>

				{/* Right: OR/AND + dim/hide toggles */}
				<div className="graph-toolbar-controls">
					<div className="graph-toggle-group" role="group" aria-label="Filter mode">
						<button
							className={`graph-toggle${filterMode === 'OR' ? ' graph-toggle--active' : ''}`}
							onClick={() => setFilterMode('OR')}
						>
							OR
						</button>
						<button
							className={`graph-toggle${filterMode === 'AND' ? ' graph-toggle--active' : ''}`}
							onClick={() => setFilterMode('AND')}
						>
							AND
						</button>
					</div>

					<div className="graph-toggle-group" role="group" aria-label="Display mode">
						<button
							className={`graph-toggle${displayMode === 'dim' ? ' graph-toggle--active' : ''}`}
							onClick={() => setDisplayMode('dim')}
						>
							dim
						</button>
						<button
							className={`graph-toggle${displayMode === 'hide' ? ' graph-toggle--active' : ''}`}
							onClick={() => setDisplayMode('hide')}
						>
							hide
						</button>
					</div>
				</div>
			</div>

			<div ref={containerRef} className="graph-container">
				<ForceGraph
					ref={fgRef}
					width={dimensions.width}
					height={dimensions.height}
					{...GRAPH_CONFIG}
					linkCurvature="curvature"
					graphData={graphData}
					linkColor={getLinkColor}
					linkLabel={(link: any) =>
						`${link.name} (${link.startActor} → ${link.resultActor})`
					}
					linkDirectionalParticleColor={getLinkParticleColor}
					nodeLabel={(node: any) => node.name}
					nodeCanvasObject={drawNode}
					onEngineStop={handleEngineStop}
				/>
			</div>
		</div>
	);
}
