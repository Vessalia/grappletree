'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { PERSPECTIVES } from '@/lib/constants';

type Node = { id: string; name: string; perspective: string; };
type Link = { source: string; target: string; name: string; actor: string; };

export function useExplore() {
	const { settings, updateSetting, resetSettings, loaded } = useSettings();
	const [allNodes, setAllNodes] = useState<Node[]>([]);
	const [allLinks, setAllLinks] = useState<Link[]>([]);
	const [selectedNode, setSelectedNode] = useState<any | null>(null);
	const [techniques, setTechniques] = useState<any[]>([]);
	const [activePerspectives, setActivePerspectives] = useState<Set<string>>(new Set(PERSPECTIVES));
	const [searchQuery, setSearchQuery] = useState('');
	const [panelOpen, setPanelOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	useEffect(() => {
		if (!loaded) return;
		setActivePerspectives(new Set(settings.defaultPerspectives));
		setPanelOpen(settings.panelOpen);
	}, [loaded]);

	useEffect(() => {
		async function fetchGraph() {
			const [pRes, tRes] = await Promise.all([
				fetch('/api/positions'),
				fetch('/api/techniques'),
			]);
			const [positions, techniqueData] = await Promise.all([pRes.json(), tRes.json()]);
			setAllNodes(positions.map((p: any) => ({ id: p.id, name: p.name, perspective: p.perspective })));
			setAllLinks(techniqueData.map((t: any) => ({ source: t.fromId, target: t.toId, name: t.name, actor: t.actor })));
		}
		fetchGraph();
	}, []);

	async function handleNodeClick(node: any) {
		setSelectedNode(node);
		if (!panelOpen) setPanelOpen(true);
		const res = await fetch(`/api/positions/${node.id}/techniques`);
		setTechniques(await res.json());
	}

	function togglePerspective(p: string) {
		setActivePerspectives(prev => {
			const next = new Set(prev);
			next.has(p) ? next.delete(p) : next.add(p);
			return next;
		});
	}

	function togglePanel() {
		const next = !panelOpen;
		setPanelOpen(next);
		updateSetting('panelOpen', next);
	}

	function toggleSettings() {
		setSettingsOpen(prev => !prev);
	}

	return {
		// data
		allNodes,
		allLinks,
		selectedNode,
		techniques,
		// filters
		activePerspectives,
		togglePerspective,
		searchQuery,
		setSearchQuery,
		// ui state
		panelOpen,
		togglePanel,
		settingsOpen,
		toggleSettings,
		handleNodeClick,
		// settings
		settings,
		updateSetting,
		resetSettings,
	};
}
