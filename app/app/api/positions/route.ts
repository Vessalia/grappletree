import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run(
			'MATCH (p:Position) RETURN p ORDER BY p.name'
		);
		const positions = result.records.map(r => r.get('p').properties);
		return NextResponse.json(positions);
	} finally {
		await session.close();
	}
}

export async function POST(request: Request) {
	const { name, notes } = await request.json();
	const session = driver.session();

	try {
		const result = await session.run(
			`CREATE (p:Position {
				id: $id,
				name: $name,
				notes: $notes
			}) RETURN p`,
			{ id: uuidv4(), name, notes: notes ?? '' }
		);

		return NextResponse.json(result.records[0].get('p').properties);
	} finally {
		await session.close();
	}
}
