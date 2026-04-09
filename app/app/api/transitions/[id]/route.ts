import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (from:Position)-[:TRANSITIONS_TO]->(t:Transition {id: $id})-[:TRANSITIONS_TO]->(to:Position)
			OPTIONAL MATCH (t)-[:HAS_CONTEXT]->(d:DisciplineContext)
			RETURN t, from.id as fromId, to.id as toId,
					collect({discipline: d.discipline, effectiveness: d.effectiveness}) as contexts`,
			{ id: params.id }
		);
		const r = result.records[0];
		const transition = {
			...r.get('t').properties,
			fromId: r.get('fromId'),
			toId: r.get('toId'),
			contexts: r.get('contexts'),
		};
		return NextResponse.json(transition);
	} finally {
		await session.close();
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { name, actor, notes, contexts } = await request.json();
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (t:Transition {id: $id})
			SET t.name = $name, t.actor = $actor, t.notes = $notes
			RETURN t`,
			{ id: params.id, name, actor, notes: notes ?? '' }
		);
		const transition = result.records[0].get('t').properties;

		if (contexts) {
			await session.run(
			'MATCH (t:Transition {id: $id})-[r:HAS_CONTEXT]->() DELETE r',
			{ id: params.id }
			);
			for (const ctx of contexts) {
			await session.run(
				`MATCH (t:Transition {id: $transitionId})
				MATCH (d:DisciplineContext {discipline: $discipline, effectiveness: $effectiveness})
				MERGE (t)-[:HAS_CONTEXT]->(d)`,
				{
				transitionId: params.id,
				discipline: ctx.discipline,
				effectiveness: ctx.effectiveness,
				}
			);
			}
		}

		return NextResponse.json(transition);
	} finally {
		await session.close();
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const session = driver.session();
	try {
		await session.run(
			`MATCH (t:Transition {id: $id}) DETACH DELETE t`,
			{ id: params.id }
		);
		return NextResponse.json({ success: true });
	} finally {
		await session.close();
	}
}
