import Link from 'next/link';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
		<nav style={{
			width: '220px',
			borderRight: '1px solid #e5e7eb',
			padding: '24px 16px',
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
		}}>
		<div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '24px' }}>
		GrappleTree
		</div>
			<Link href="/admin/positions" style={{ padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
				Positions
			</Link>
			<Link href="/admin/transitions" style={{ padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
				Transitions
			</Link>
		</nav>
		<main style={{ flex: 1, padding: '32px' }}>
			{children}
		</main>
	</div>
	);
}
