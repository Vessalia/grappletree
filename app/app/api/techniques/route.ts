import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';
import { labelToEffectiveness, effectivenessToLabel } from '@/lib/utils';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (from:Position)-[s:TRANSITION_START]->(t:Technique)-[r:TRANSITION_END]->(to:Position)
			OPTIONAL MATCH (t)-[hc:HAS_CONTEXT]->(d:Discipline)
			RETURN t,
				from.id as fromId,
				to.id as toId,
				s.actor as startActor,
				r.actor as resultActor,
				collect({
					id: d.id,
					name: d.name,
					effectiveness: hc.effectiveness
				}) as contexts
			ORDER BY t.name`
		);

		const techniques = result.records.map(r => ({
			...r.get('t').properties,
			fromId: r.get('fromId'),
			toId: r.get('toId'),
			startActor: r.get('startActor'),
			resultActor: r.get('resultActor'),
			contexts: r.get('contexts')
				.filter((c: any) => c.name != null && c.effectiveness != null)
				.map((c: any) => ({
					id: c.id,
					name: c.name,
					effectiveness: effectivenessToLabel(c.effectiveness)
				}))
		}));

		return NextResponse.json(techniques);
	} finally {
		await session.close();
	}
}

export async function POST(request: Request) {
	const {
		fromId,
		toId,
		name,
		startActor,
		resultActor,
		notes,
		contexts
	} = await request.json();

	const session = driver.session();

	try {
		const id = uuidv4();

		await session.run(
			`MATCH (from:Position {id: $fromId})
			MATCH (to:Position {id: $toId})
			CREATE (t:Technique {
				id: $id,
				name: $name,
				notes: $notes
			})
			CREATE (from)-[:TRANSITION_START {actor: $startActor}]->(t)
			CREATE (t)-[:TRANSITION_END {actor: $resultActor}]->(to)`,
			{ id, fromId, toId, name, notes: notes ?? '', startActor, resultActor }
		);

		if (contexts?.length) {
			for (const ctx of contexts) {
				await session.run(
					`MATCH (t:Technique {id: $id})
					MERGE (d:Discipline {name: $name})
					MERGE (t)-[hc:HAS_CONTEXT]->(d)
					SET hc.effectiveness = $effectiveness`,
					{
						id,
						name: ctx.name,
						effectiveness: labelToEffectiveness(ctx.effectiveness)
					}
				);
			}
		}

		return NextResponse.json({ success: true, id });
	} finally {
		await session.close();
	}
}
