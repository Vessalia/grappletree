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
			`MATCH (from:Position)-[:STARTS]->(t:Technique {id: $id})-[:RESULTS_IN]->(to:Position)
			OPTIONAL MATCH (t)-[:HAS_CONTEXT]->(d:DisciplineContext)
			RETURN t, from.id as fromId, to.id as toId,
					collect({discipline: d.discipline, effectiveness: d.effectiveness}) as contexts`,
			{ id }
		);
		const r = result.records[0];
		const technique = {
			...r.get('t').properties,
			fromId: r.get('fromId'),
			toId: r.get('toId'),
			contexts: r.get('contexts'),
		};
		return NextResponse.json(technique);
	} finally {
		await session.close();
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const { name, actor, notes, contexts } = await request.json();
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (t:Technique {id: $id})
			SET t.name = $name, t.actor = $actor, t.notes = $notes
			RETURN t`,
			{ id, name, actor, notes: notes ?? '' }
		);
		const technique = result.records[0].get('t').properties;

		if (contexts) {
			await session.run(
				'MATCH (t:Technique {id: $id})-[r:HAS_CONTEXT]->() DELETE r',
				{ id }
			);
			for (const ctx of contexts) {
				if (!ctx.discipline || !ctx.effectiveness) continue;
				await session.run(
					`MATCH (t:Technique {id: $techniqueId})
					MATCH (d:DisciplineContext {discipline: $discipline, effectiveness: $effectiveness})
					MERGE (t)-[:HAS_CONTEXT]->(d)`,
					{
						techniqueId: id,
						discipline: ctx.discipline,
						effectiveness: ctx.effectiveness,
					}
				);
			}
		}

		return NextResponse.json(technique);
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
