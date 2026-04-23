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
			`MATCH (p:Position {id: $id})
			OPTIONAL MATCH (p)-[hc:HAS_CONTEXT]->(d:Discipline)
			RETURN p,
				collect({
					name: d.name,
					effectiveness: hc.effectiveness
				}) as contexts`,
			{ id }
		);
		const r = result.records[0];
		return NextResponse.json({
			...r.get('p').properties,
			contexts: r.get('contexts'),
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
	const { name, notes, contexts } = await request.json();
	const session = driver.session();

	try {
		await session.run(
			`MATCH (p:Position {id: $id})
			SET p.name = $name, p.notes = $notes`,
			{ id, name, notes: notes ?? '' }
		);

		// reset contexts
		await session.run(
			`MATCH (p:Position {id: $id})-[hc:HAS_CONTEXT]->() DELETE hc`,
			{ id }
		);

		if (contexts?.length) {
			for (const ctx of contexts) {
				await session.run(
					`MATCH (p:Position {id: $id})
					MERGE (d:Discipline {name: $name})
					MERGE (p)-[hc:HAS_CONTEXT]->(d)
					SET hc.effectiveness = $effectiveness`,
					{
						id,
						name: ctx.name,
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
			'MATCH (p:Position {id: $id}) DETACH DELETE p',
			{ id }
		);
		return NextResponse.json({ success: true });
	} finally {
		await session.close();
	}
}