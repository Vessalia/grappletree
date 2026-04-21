import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
	return (
		<div className="landing-shell">
			<div className="landing-content">
				<div className="landing-logo">GRAPPLE TREE</div>
				<p className="landing-tagline">A knowledge graph for grapplers</p>
				<div className="landing-cards">
					<Link href="/explore" className="landing-card">
						<div className="landing-card-title">Explore</div>
						<div className="landing-card-desc">
							Browse positions, techniques, and connections across disciplines
						</div>
						<div className="landing-card-arrow">→</div>
					</Link>
					<Link href="/admin" className="landing-card landing-card-admin">
						<div className="landing-card-title">Admin</div>
						<div className="landing-card-desc">
							Manage the database — positions, techniques, and contexts
						</div>
						<div className="landing-card-arrow">→</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
