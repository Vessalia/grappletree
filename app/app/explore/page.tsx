'use client';

import './explore.css';
import { useExplore } from './hooks/useExplore';
import { PERSPECTIVES, PERSPECTIVE_COLORS } from '@/lib/constants';
import GraphCanvas from './components/GraphCanvas';
import DetailPanel from './components/DetailPanel';
import SettingsPanel from './components/SettingsPanel';

export default function ExplorePage() {
	const explore = useExplore();

	return (
		<div className="explore-shell">

			<div className="explore-toolbar">
				<div className="explore-toolbar-logo">GRAPPLE TREE</div>

				<div className="explore-search">
					<input
						className="explore-search-input"
						placeholder="Search positions..."
						value={explore.searchQuery}
						onChange={e => explore.setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="explore-filter-group">
					<span className="explore-filter-label">view</span>
					{PERSPECTIVES.map(p => (
						<button
							key={p}
							className={`explore-filter-btn ${explore.activePerspectives.has(p) ? 'active' : ''}`}
							style={explore.activePerspectives.has(p) ? {
							background: PERSPECTIVE_COLORS[p],
							borderColor: PERSPECTIVE_COLORS[p],
							} : {}}
							onClick={() => explore.togglePerspective(p)}
						>
							{p}
						</button>
					))}
				</div>

				<div className="explore-toolbar-right">
					<button
						className={`explore-icon-btn ${explore.settingsOpen ? 'active' : ''}`}
						onClick={explore.toggleSettings}
						title="Settings"
					>
						⚙
					</button>
					<button
						className={`explore-icon-btn ${explore.panelOpen ? 'active' : ''}`}
						onClick={explore.togglePanel}
						title="Toggle detail panel"
					>
						▤
					</button>
				</div>
			</div>

			<div className="explore-body">
				<div className="explore-graph">
					<GraphCanvas
						allNodes={explore.allNodes}
						allLinks={explore.allLinks}
						activePerspectives={explore.activePerspectives}
						searchQuery={explore.searchQuery}
						settings={explore.settings}
						onNodeClick={explore.handleNodeClick}
						selectedNodeId={explore.selectedNode?.id ?? null}
					/>
				</div>
				<DetailPanel
					position={explore.selectedNode}
					transitions={explore.transitions}
					isOpen={explore.panelOpen}
					settings={explore.settings}
				/>
			</div>

			{explore.settingsOpen && (
				<SettingsPanel
					settings={explore.settings}
					updateSetting={explore.updateSetting}
					resetSettings={explore.resetSettings}
					onClose={explore.toggleSettings}
				/>
			)}

		</div>
	);
}
