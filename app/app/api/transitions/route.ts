import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (from:Position)-[:TRANSITIONS_TO]->(t:Transition)-[:TRANSITIONS_TO]->(to:Position)
			OPTIONAL MATCH (t)-[:HAS_CONTEXT]->(d:DisciplineContext)
			RETURN t, from.id as fromId, to.id as toId,
					collect({discipline: d.discipline, effectiveness: d.effectiveness}) as contexts
			ORDER BY t.name`
		);
		const transitions = result.records.map(r => ({
			...r.get('t').properties,
			fromId: r.get('fromId'),
			toId: r.get('toId'),
			contexts: r.get('contexts').filter(
				(c: any) => c.discipline != null && c.effectiveness != null
			),
		}));
		return NextResponse.json(transitions);
	} finally {
		await session.close();
	}
}

export async function POST(request: Request) {
	const { fromId, toId, name, actor, notes, contexts } = await request.json();
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (from:Position {id: $fromId}), (to:Position {id: $toId})
			CREATE (from)-[:TRANSITIONS_TO]->(t:Transition {
				id: $id,
				name: $name,
				actor: $actor,
				notes: $notes
			})-[:TRANSITIONS_TO]->(to)
			RETURN t`,
			{ fromId, toId, id: uuidv4(), name, actor, notes: notes ?? '' }
		);
		const transition = result.records[0].get('t').properties;

		if (contexts && contexts.length > 0) {
			for (const ctx of contexts) {
			await session.run(
				`MATCH (t:Transition {id: $transitionId})
				MATCH (d:DisciplineContext {discipline: $discipline, effectiveness: $effectiveness})
				MERGE (t)-[:HAS_CONTEXT]->(d)`,
				{ transitionId: transition.id, discipline: ctx.discipline, effectiveness: ctx.effectiveness }
			);
			}
		}

		return NextResponse.json(transition);
	} finally {
		await session.close();
	}
}
