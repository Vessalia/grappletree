'use client';

import './admin.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const navItems = [
		{ href: '/admin/positions', label: 'Positions' },
		{ href: '/admin/transitions', label: 'Transitions' },
		{ href: '/admin/graph', label: 'Graph' },
	];

	const currentPage = navItems.find(i => pathname.startsWith(i.href))?.label ?? 'Admin';

	return (
		<div className="admin-shell">
			<aside className="sidebar">
				<div className="sidebar-logo">Grapple Tree</div>
				<div className="sidebar-section">
					<div className="sidebar-label">Data</div>
					{navItems.map(item => (
					<Link
						key={item.href}
						href={item.href}
						className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
					>
						{item.label}
					</Link>
					))}
				</div>
			</aside>
			<div className="admin-main">
				<div className="admin-topbar">
					<span className="admin-topbar-title">
						admin / <span>{currentPage.toLowerCase()}</span>
					</span>
				</div>
				<div className="admin-content">
					{children}
				</div>
			</div>
		</div>
	);
}
