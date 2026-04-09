import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { name, perspective, notes } = await request.json();
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (p:Position {id: $id})
			SET p.name = $name, p.perspective = $perspective, p.notes = $notes
			RETURN p`,
			{ id: params.id, name, perspective, notes: notes ?? '' }
		);
		const position = result.records[0].get('p').properties;
		return NextResponse.json(position);
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
			'MATCH (p:Position {id: $id}) DETACH DELETE p',
			{ id: params.id }
		);
		return NextResponse.json({ success: true });
	} finally {
		await session.close();
	}
}
