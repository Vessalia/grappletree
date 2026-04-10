import { SlotProps } from './index';
import { PERSPECTIVE_COLORS } from '@/lib/constants';

export default function TransitionsOutSlot({ transitions }: SlotProps) {
	const out = transitions.filter(t => t.direction === 'out');
	if (out.length === 0) return <div className="explore-empty">none recorded</div>;

	return (
		<div>
			{out.map(t => (
				<div key={t.id} className="explore-transition-item">
					<div className="explore-transition-name">{t.name}</div>
					<div className="explore-transition-meta">
						<span
							className="explore-transition-position"
							style={{ color: PERSPECTIVE_COLORS[t.relatedPerspective] ?? '#888' }}
						>
							→ {t.relatedName}
						</span>
						<span className="explore-context-badge">{t.actor}</span>
						{t.contexts.map((ctx: any, i: number) => (
							<span key={i} className="explore-context-badge">
								{ctx.discipline} · {ctx.effectiveness}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
