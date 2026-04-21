'use client';

import { useDetailPanel } from '../hooks/useDetailPanel';
import { PERSPECTIVE_COLORS } from '@/lib/constants';
import { ExploreSettings } from '@/hooks/useSettings';

type Props = {
	position: any | null;
	techniques: any[];
	isOpen: boolean;
	settings: ExploreSettings;
};

export default function DetailPanel({ position, techniques, isOpen, settings }: Props) {
	const { collapsed, toggleSlot, visibleSlots } = useDetailPanel(settings);

	return (
		<div className={`explore-panel ${isOpen ? '' : 'closed'}`}>
			<div className="explore-panel-inner">
				{!position ? (
					<div className="explore-panel-empty">
						<span>select a position</span>
						<span style={{ fontSize: '10px' }}>click any node to explore</span>
					</div>
				) : (
					<>
						<div className="explore-panel-header">
							<div className="explore-panel-name">{position.name}</div>
							<div className="explore-panel-meta">
								<span
									className="explore-panel-badge"
									style={{
										borderColor: PERSPECTIVE_COLORS[position.perspective] ?? '#e8e8e4',
										color: PERSPECTIVE_COLORS[position.perspective] ?? '#666',
									}}
								>
									{position.perspective}
								</span>
							</div>
						</div>
						<div className="explore-panel-body">
							{visibleSlots.map(slot => {
								const SlotComponent = slot.component;
								const isCollapsed = collapsed.has(slot.id);
								return (
									<div key={slot.id} className="explore-slot">
										<div
											className="explore-slot-header"
											onClick={() => toggleSlot(slot.id)}
										>
											<span className="explore-slot-title">{slot.label}</span>
											<span className="explore-slot-toggle">{isCollapsed ? '▸' : '▾'}</span>
										</div>
										{!isCollapsed && (
											<div className="explore-slot-body">
												<SlotComponent position={position} techniques={techniques} />
											</div>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
