'use client';

import { ExploreSettings } from '@/hooks/useSettings';
import { PERSPECTIVES, DISCIPLINES, PERSPECTIVE_COLORS, DISCIPLINE_COLORS } from '@/lib/constants';
import { toggleArrayValue } from '@/lib/utils';
import { DETAIL_SLOTS } from './slots/index';

type Props = {
	settings: ExploreSettings;
	updateSetting: <K extends keyof ExploreSettings>(key: K, value: ExploreSettings[K]) => void;
	resetSettings: () => void;
	onClose: () => void;
};

export default function SettingsPanel({ settings, updateSetting, resetSettings, onClose }: Props) {
	return (
		<div className="settings-overlay" onClick={onClose}>
			<div className="settings-panel" onClick={e => e.stopPropagation()}>
				<div className="settings-header">
					<span>settings</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
				</div>

				<div className="settings-section">
					<div className="settings-section-title">Search</div>
					<div className="settings-row">
						<span>Search mode</span>
						<div className="settings-toggle">
							{(['filter', 'highlight'] as const).map(mode => (
								<button
									key={mode}
									className={`settings-toggle-btn ${settings.searchMode === mode ? 'active' : ''}`}
									onClick={() => updateSetting('searchMode', mode)}
								>
									{mode}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="settings-section">
					<div className="settings-section-title">Graph</div>
					<div className="settings-row">
						<span>Direction arrows</span>
						<div className="settings-toggle">
							{(['on', 'off'] as const).map(val => (
								<button
									key={val}
									className={`settings-toggle-btn ${settings.showArrows === (val === 'on') ? 'active' : ''}`}
									onClick={() => updateSetting('showArrows', val === 'on')}
								>
									{val}
								</button>
							))}
						</div>
					</div>
					<div className="settings-row">
						<span>Label zoom threshold</span>
						<input
							type="range"
							min="0.5"
							max="3"
							step="0.1"
							value={settings.labelZoomThreshold}
							onChange={e => updateSetting('labelZoomThreshold', parseFloat(e.target.value))}
							style={{ width: '100px' }}
						/>
					</div>
				</div>

				<div className="settings-section">
					<div className="settings-section-title">Default disciplines</div>
					<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
						{DISCIPLINES.map(d => (
							<button
								key={d}
								className={`settings-toggle-btn ${settings.defaultDisciplines.includes(d) ? 'active' : ''}`}
								style={settings.defaultDisciplines.includes(d) ? { background: DISCIPLINE_COLORS[d], borderColor: DISCIPLINE_COLORS[d] } : {}}
								onClick={() => updateSetting('defaultDisciplines', toggleArrayValue(settings.defaultDisciplines, d))}
							>
								{d}
							</button>
						))}
					</div>
				</div>

				<div className="settings-section">
					<div className="settings-section-title">Default perspectives</div>
					<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
						{PERSPECTIVES.map(p => (
							<button
								key={p}
								className={`settings-toggle-btn ${settings.defaultPerspectives.includes(p) ? 'active' : ''}`}
								style={settings.defaultPerspectives.includes(p) ? { background: PERSPECTIVE_COLORS[p], borderColor: PERSPECTIVE_COLORS[p] } : {}}
								onClick={() => updateSetting('defaultPerspectives', toggleArrayValue(settings.defaultPerspectives, p))}
							>
								{p}
							</button>
						))}
					</div>
				</div>

				<div className="settings-section">
					<div className="settings-section-title">Visible slots</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						{DETAIL_SLOTS.map(slot => (
							<div key={slot.id} className="settings-row">
								<span>{slot.label}</span>
								<div className="settings-toggle">
									<button
										className={`settings-toggle-btn ${settings.visibleSlots.includes(slot.id) ? 'active' : ''}`}
										onClick={() => updateSetting('visibleSlots', toggleArrayValue(settings.visibleSlots, slot.id))}
									>
										{settings.visibleSlots.includes(slot.id) ? 'on' : 'off'}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				<button className="settings-reset" onClick={resetSettings}>
					reset to defaults
				</button>
			</div>
		</div>
	);
}
