export const DISCIPLINE_COLORS: Record<string, string> = {
	bjj: '#8b5cf6',
	mma: '#ef4444',
	wrestling: '#f59e0b',
	judo: '#0aac0a'
};

export const DISCIPLINES = Object.keys(DISCIPLINE_COLORS);
export const EFFECTIVENESS_LEVELS = [
	{ label: 'core',        min: 0.75 },
	{ label: 'effective',   min: 0.5 },
	{ label: 'situational', min: 0.25 },
	{ label: 'ineffective', min: 0.0 },
];
export const EFFECTIVENESS_LABELS = EFFECTIVENESS_LEVELS.map(l => l.label);

export const ACTORS = ['attacker', 'defender', 'either', 'bottom', 'top'];
