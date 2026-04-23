import { EFFECTIVENESS_LEVELS } from '@/lib/constants';

export function toggleArrayValue<T>(arr: T[], value: T): T[] {
	return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export function effectivenessToLabel(value: number): string {
	for (const level of EFFECTIVENESS_LEVELS) {
		if (value >= level.min) return level.label;
	}

	return 'ineffective';
}
export function labelToEffectiveness(label: string): number {
	const idx = EFFECTIVENESS_LEVELS.findIndex(l => l.label === label);
	if (idx === -1) return 0;

	const current = EFFECTIVENESS_LEVELS[idx];
	const next = EFFECTIVENESS_LEVELS[idx + 1];

	if (!next) return 0; // bottom bucket

	return (current.min + next.min) / 2;
}
