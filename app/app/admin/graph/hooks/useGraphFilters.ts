'use client';
import { useState, useMemo } from 'react';
import type { Node, Link, ContextNode } from './useGraphData';

export type FilterMode = 'OR' | 'AND';
export type DisplayMode = 'hide' | 'dim';

const CORE_CONTEXTS = ['BJJ', 'MMA', 'Wrestling', 'Judo'];

export function useGraphFilters(
	graphData: { nodes: Node[]; links: Link[] },
	contextNodes: ContextNode[]
) {
	const [activeContextIds, setActiveContextIds] = useState<Set<string>>(new Set());
	const [filterMode, setFilterMode] = useState<FilterMode>('OR');
	const [displayMode, setDisplayMode] = useState<DisplayMode>('hide');

	// Split context nodes into core-4 and extras, preserving API order within each group
	const { coreContexts, extraContexts } = useMemo(() => {
		const core: ContextNode[] = [];
		const extra: ContextNode[] = [];
		for (const ctx of contextNodes) {
			if (CORE_CONTEXTS.includes(ctx.name)) {
				core.push(ctx);
			} else {
				extra.push(ctx);
			}
		}
		// Sort core to match the canonical CORE_CONTEXTS order
		core.sort((a, b) => CORE_CONTEXTS.indexOf(a.name) - CORE_CONTEXTS.indexOf(b.name));
		return { coreContexts: core, extraContexts: extra };
	}, [contextNodes]);

	const toggleContext = (id: string) => {
		setActiveContextIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

    const clearFilters = () => setActiveContextIds(new Set());

	// For each node, collect which context IDs it links to (via links where target is a context node)
	const contextIdSet = useMemo(
		() => new Set(contextNodes.map(c => c.id)),
		[contextNodes]
	);

	// nodeContexts: nodeId -> Set<contextId> (contexts this node is directly linked to)
	const nodeContexts = useMemo(() => {
		const map = new Map<string, Set<string>>();
		for (const link of graphData.links) {
			const src = (link.source as any)?.id ?? link.source;
			const tgt = (link.target as any)?.id ?? link.target;
			if (contextIdSet.has(tgt)) {
				if (!map.has(src)) map.set(src, new Set());
				map.get(src)!.add(tgt);
			}
			if (contextIdSet.has(src)) {
				if (!map.has(tgt)) map.set(tgt, new Set());
				map.get(tgt)!.add(src);
			}
		}
		return map;
	}, [graphData.links, contextIdSet]);

	// Derive the set of visible node IDs given active filters
	const visibleNodeIds = useMemo<Set<string> | null>(() => {
		if (activeContextIds.size === 0) return null; // null = show everything

		const visible = new Set<string>();
		for (const node of graphData.nodes) {
			const nodeCtxs = nodeContexts.get(node.id) ?? new Set();
			const matches =
				filterMode === 'OR'
					? [...activeContextIds].some(id => nodeCtxs.has(id))
					: [...activeContextIds].every(id => nodeCtxs.has(id));
			if (matches) visible.add(node.id);
		}
		return visible;
	}, [activeContextIds, filterMode, graphData.nodes, nodeContexts]);

	// A link is visible only if both endpoints are visible
	const visibleLinkIds = useMemo<Set<number> | null>(() => {
		if (visibleNodeIds === null) return null;
		const visible = new Set<number>();
		graphData.links.forEach((link, i) => {
			const src = (link.source as any)?.id ?? link.source;
			const tgt = (link.target as any)?.id ?? link.target;
			if (visibleNodeIds.has(src) && visibleNodeIds.has(tgt)) {
				visible.add(i);
			}
		});
		return visible;
	}, [visibleNodeIds, graphData.links]);

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
	};
}
