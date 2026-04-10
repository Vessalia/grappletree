'use client';

import { useState } from 'react';
import { DETAIL_SLOTS } from '../components/slots/index';
import { ExploreSettings } from '@/hooks/useSettings';

export function useDetailPanel(settings: ExploreSettings) {
	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

	function toggleSlot(id: string) {
		setCollapsed(prev => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}

	const visibleSlots = DETAIL_SLOTS.filter(s => settings.visibleSlots.includes(s.id));

	return { collapsed, toggleSlot, visibleSlots };
}
