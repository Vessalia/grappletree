export const DISCIPLINE_DETAILS = [
	{ label: 'bjj',       color: '#8b5cf6' },
	{ label: 'mma',       color: '#ef4444' },
	{ label: 'wrestling', color: '#f59e0b' },
	{ label: 'judo',      color: '#0aac0a' },
];
export const DISCIPLINES = DISCIPLINE_DETAILS.map(l => l.label);

export const EFFECTIVENESS_LEVELS = [
	{ label: 'core',        min: 0.75 },
	{ label: 'effective',   min: 0.5  },
	{ label: 'situational', min: 0.25 },
	{ label: 'ineffective', min: 0.0  },
];
export const EFFECTIVENESS_LABELS = EFFECTIVENESS_LEVELS.map(l => l.label);

export const ACTORS = ['attacker', 'defender', 'either', 'bottom', 'top'];
