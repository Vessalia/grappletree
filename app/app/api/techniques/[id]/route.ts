import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';
import { labelToEffectiveness } from '@/lib/utils';

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const session = driver.session();

	try {
		const result = await session.run(
			`MATCH (from:Position)-[s:TRANSITION_START]->(t:Technique {id: $id})-[r:TRANSITION_END]->(to:Position)
			OPTIONAL MATCH (t)-[hc:HAS_CONTEXT]->(d:DisciplineContext)
			RETURN t,
				from.id as fromId,
				to.id as toId,
				s.actor as startActor,
				r.actor as resultActor,
				collect({
					discipline: d.discipline,
					effectiveness: hc.effectiveness
				}) as contexts`,
			{ id }
		);

		const r = result.records[0];

		return NextResponse.json({
			...r.get('t').properties,
			fromId: r.get('fromId'),
			toId: r.get('toId'),
			startActor: r.get('startActor'),
			resultActor: r.get('resultActor'),
			contexts: r.get('contexts')
		});
	} finally {
		await session.close();
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const {
		name,
		notes,
		fromId,
		toId,
		startActor,
		resultActor,
		contexts
	} = await request.json();

	const session = driver.session();

	try {
		// update node
		await session.run(
			`MATCH (t:Technique {id: $id})
			SET t.name = $name, t.notes = $notes`,
			{ id, name, notes: notes ?? '' }
		);

		// remove old relationships
		await session.run(
			`MATCH (t:Technique {id: $id})
			OPTIONAL MATCH (p1)-[s:TRANSITION_START]->(t)
			OPTIONAL MATCH (t)-[r:TRANSITION_END]->(p2)
			DELETE s, r`,
			{ id }
		);

		// recreate relationships
		await session.run(
			`MATCH (from:Position {id: $fromId})
			MATCH (to:Position {id: $toId})
			MATCH (t:Technique {id: $id})
			CREATE (from)-[:TRANSITION_START {actor: $startActor}]->(t)
			CREATE (t)-[:TRANSITION_END {actor: $resultActor}]->(to)`,
			{ id, fromId, toId, startActor, resultActor }
		);

		// reset contexts
		await session.run(
			`MATCH (t:Technique {id: $id})-[hc:HAS_CONTEXT]->() DELETE hc`,
			{ id }
		);

		if (contexts?.length) {
			for (const ctx of contexts) {
				await session.run(
					`MATCH (t:Technique {id: $id})
					MERGE (d:DisciplineContext {discipline: $discipline})
					MERGE (t)-[hc:HAS_CONTEXT]->(d)
					SET hc.effectiveness = $effectiveness`,
					{
						id,
						discipline: ctx.discipline,
						effectiveness: labelToEffectiveness(ctx.effectiveness)
					}
				);
			}
		}

		return NextResponse.json({ success: true });
	} finally {
		await session.close();
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const session = driver.session();

	try {
		await session.run(
			`MATCH (t:Technique {id: $id}) DETACH DELETE t`,
			{ id }
		);

		return NextResponse.json({ success: true });
	} finally {
		await session.close();
	}
}
