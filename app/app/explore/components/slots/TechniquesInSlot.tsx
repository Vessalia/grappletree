import { SlotProps } from './index';
import { PERSPECTIVE_COLORS } from '@/lib/constants';

export default function TechniquesInSlot({ techniques }: SlotProps) {
	const inbound = techniques.filter(t => t.direction === 'in');
	if (inbound.length === 0) return <div className="explore-empty">none recorded</div>;

	return (
		<div>
			{inbound.map(t => (
				<div key={t.id} className="explore-technique-item">
					<div className="explore-technique-name">{t.name}</div>
					<div className="explore-technique-meta">
						<span
							className="explore-technique-position"
							style={{ color: PERSPECTIVE_COLORS[t.relatedPerspective] ?? '#888' }}
						>
							← {t.relatedName}
						</span>
						<span className="explore-context-badge">{t.actor}</span>
						{t.contexts.map((ctx: any, i: number) => (
							<span key={i} className="explore-context-badge">
								{ctx.name} · {ctx.effectiveness}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
