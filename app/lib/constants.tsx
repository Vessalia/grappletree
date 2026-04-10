export const PERSPECTIVE_COLORS: Record<string, string> = {
	top: '#f59e0b',
	bottom: '#3b82f6',
	attacker: '#ef4444',
	defender: '#22c55e',
	neutral: '#888888',
};

export const OPPOSING_PERSPECTIVES: Record<string, string> = {
	top: 'bottom',
	bottom: 'top',
	attacker: 'defender',
	defender: 'attacker',
};

export const PERSPECTIVES = Object.keys(PERSPECTIVE_COLORS);

export const DISCIPLINES = ['mma', 'bjj', 'wrestling', 'judo'];
export const DISCIPLINE_EFFECTIVENESS_LEVELS = ['core', 'effective', 'situational', 'ineffective'];

export const DISCIPLINE_COLORS: Record<string, string> = {
	bjj: '#8b5cf6',
	mma: '#ef4444',
	wrestling: '#f59e0b',
	judo: '#0aac0a'
};
