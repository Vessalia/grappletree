import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';
import { labelToEffectiveness, effectivenessToLabel } from '@/lib/utils';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (p:Position)
			OPTIONAL MATCH (p)-[hc:HAS_CONTEXT]->(d:Discipline)
			RETURN p,
				collect({
					id: d.id,
					name: d.name,
					effectiveness: hc.effectiveness
				}) as contexts
			 ORDER BY p.name`
		);

		const positions = result.records.map(r => ({
			...r.get('p').properties,
			contexts: r.get('contexts')
				.filter((c: any) => c.name != null && c.effectiveness != null)
				.map((c: any) => ({
					id: c.id,
					name: c.name,
					effectiveness: effectivenessToLabel(c.effectiveness)
				}))
		}));

		return NextResponse.json(positions);
	} finally {
		await session.close();
	}
}

export async function POST(request: Request) {
	const { name, notes, contexts } = await request.json();
	const session = driver.session();

	try {
		const uuid = uuidv4();

		const result = await session.run(
			`CREATE (p:Position {
				id: $id,
				name: $name,
				notes: $notes
			}) RETURN p`,
			{ id: uuid, name, notes: notes ?? '' }
		);

		if (contexts?.length) {
			for (const ctx of contexts) {
				await session.run(
					`MATCH (p:Position {id: $id})
					MERGE (d:Discipline {name: $name})
					MERGE (p)-[hc:HAS_CONTEXT]->(d)
					SET hc.effectiveness = $effectiveness`,
					{
						uuid,
						name: ctx.name,
						effectiveness: labelToEffectiveness(ctx.effectiveness)
					}
				);
			}
		}

		return NextResponse.json(result.records[0].get('p').properties);
	} finally {
		await session.close();
	}
}
