'use client';
import { useState, useMemo } from 'react';
import type { Node, Link, ContextNode } from './useGraphData';
import { DISCIPLINE_DETAILS } from '@/lib/constants';

export type FilterMode = 'OR' | 'AND';
export type DisplayMode = 'hide' | 'dim';

// Canonical order + per-discipline color, keyed by lowercase discipline name

export function useGraphFilters(
	graphData: { nodes: Node[]; links: Link[] },
	contextNodes: ContextNode[]
) {
	const [activeContextIds, setActiveContextIds] = useState<Set<string>>(new Set());
	const [filterMode, setFilterMode] = useState<FilterMode>('OR');
	const [displayMode, setDisplayMode] = useState<DisplayMode>('hide');

	const { coreContexts, extraContexts } = useMemo(() => {
		const coreLabels = DISCIPLINE_DETAILS.map(d => d.label);
		const core: ContextNode[] = [];
		const extra: ContextNode[] = [];

		for (const ctx of contextNodes) {
			if (ctx.name && coreLabels.includes(ctx.name.toLowerCase())) {
				core.push(ctx);
			} else {
				extra.push(ctx);
			}
		}

		// Preserve canonical order for core
		core.sort(
			(a, b) => coreLabels.indexOf(a.name.toLowerCase()) -
					  coreLabels.indexOf(b.name.toLowerCase())
		);

		return { coreContexts: core, extraContexts: extra };
	}, [contextNodes]);

	// Color lookup for pills — falls back to a neutral for extras
	const getContextColor = (name: string): string => {
		const detail = DISCIPLINE_DETAILS.find(d => d.label === name.toLowerCase());
		return detail?.color ?? '#888888';
	};

	const toggleContext = (id: string) => {
		setActiveContextIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const clearFilters = () => setActiveContextIds(new Set());

	// Derive visible node IDs directly from contextIds on each node
	const visibleNodeIds = useMemo<Set<string> | null>(() => {
		if (activeContextIds.size === 0) return null;

		const visible = new Set<string>();
		for (const node of graphData.nodes) {
			const nodeCtxs = new Set(node.contextIds);
			const matches =
				filterMode === 'OR'
					? [...activeContextIds].some(id => nodeCtxs.has(id))
					: [...activeContextIds].every(id => nodeCtxs.has(id));
			if (matches) visible.add(node.id);
		}
		return visible;
	}, [activeContextIds, filterMode, graphData.nodes]);

	// A link is visible only if both endpoints are visible, and it exists in the context
	const visibleLinkIds = useMemo<Set<number> | null>(() => {
		if (visibleNodeIds === null) return null;
		const visible = new Set<number>();

		graphData.links.forEach((link, i) => {
			const src = (link.source as any)?.id ?? link.source;
			const tgt = (link.target as any)?.id ?? link.target;

			const linkCtxs = new Set(link.contextIds);
			const linkMatches =
				filterMode === 'OR'
					? [...activeContextIds].some(id => linkCtxs.has(id))
					: [...activeContextIds].every(id => linkCtxs.has(id));

			if (linkMatches && visibleNodeIds.has(src) && visibleNodeIds.has(tgt)) {
				visible.add(i);
			}
		});

		return visible;
	}, [visibleNodeIds, graphData.links, activeContextIds, filterMode]);

	return {
		coreContexts,
		extraContexts,
		activeContextIds,
		filterMode,
		displayMode,
		visibleNodeIds,
		visibleLinkIds,
		toggleContext,
		clearFilters,
		setFilterMode,
		setDisplayMode,
		getContextColor,
	};
}