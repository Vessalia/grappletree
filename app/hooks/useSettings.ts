'use client';

import { useState, useEffect } from 'react';
import { PERSPECTIVES, DISCIPLINES } from '@/lib/constants';

export type ExploreSettings = {
	searchMode: 'filter' | 'highlight';
	showArrows: boolean;
	labelZoomThreshold: number;
	defaultDisciplines: string[];
	defaultPerspectives: string[];
	panelOpen: boolean;
	visibleSlots: string[];
};

const DEFAULT_SETTINGS: ExploreSettings = {
	searchMode: 'filter',
	showArrows: true,
	labelZoomThreshold: 1.5,
	defaultDisciplines: DISCIPLINES,
	defaultPerspectives: PERSPECTIVES,
	panelOpen: false,
	visibleSlots: ['techniques_out', 'techniques_in', 'notes'],
};

const STORAGE_KEY = 'grappletree_explore_settings';

export function useSettings() {
	const [settings, setSettings] = useState<ExploreSettings>(DEFAULT_SETTINGS);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
			setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
			}
		} catch {
			// ignore
		}
		setLoaded(true);
	}, []);

	function updateSetting<K extends keyof ExploreSettings>(
		key: K,
		value: ExploreSettings[K]
	) {
	setSettings(prev => {
		const next = { ...prev, [key]: value };
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {
			// ignore
		}
		return next;
	});
	}

	function resetSettings() {
		setSettings(DEFAULT_SETTINGS);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}

	return { settings, updateSetting, resetSettings, loaded };
}