import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (p:Position {id: $id})
			OPTIONAL MATCH (p)-[:TRANSITION_START]->(t:Technique)-[:TRANSITION_END]->(to:Position)
			OPTIONAL MATCH (t)-[:HAS_CONTEXT]->(d:DisciplineContext)
			WITH p, t, to, collect({discipline: d.discipline, effectiveness: d.effectiveness}) as contexts, 'out' as direction
			WHERE t IS NOT NULL
			RETURN t, to.id as relatedId, to.name as relatedName, to.perspective as relatedPerspective, contexts, direction
			UNION
			MATCH (p:Position {id: $id})
			OPTIONAL MATCH (from:Position)-[:TRANSITION_START]->(t:Technique)-[:TRANSITION_END]->(p)
			OPTIONAL MATCH (t)-[:HAS_CONTEXT]->(d:DisciplineContext)
			WITH p, t, from, collect({discipline: d.discipline, effectiveness: d.effectiveness}) as contexts, 'in' as direction
			WHERE t IS NOT NULL
			RETURN t, from.id as relatedId, from.name as relatedName, from.perspective as relatedPerspective, contexts, direction`,
			{ id }
		);

		const techniques = result.records.map(r => ({
			...r.get('t').properties,
			relatedId: r.get('relatedId'),
			relatedName: r.get('relatedName'),
			relatedPerspective: r.get('relatedPerspective'),
			contexts: r.get('contexts').filter(
				(c: any) => c.discipline != null && c.effectiveness != null
			),
			direction: r.get('direction'),
		}));

		return NextResponse.json(techniques);
	} finally {
		await session.close();
	}
}