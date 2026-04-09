import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run('MATCH (p:Position) RETURN p');
		const positions = result.records.map(record => record.get('p').properties);
		return NextResponse.json(positions);
	} finally {
		await session.close();
	}
}

export async function POST(request: Request) {
	const { name, perspective } = await request.json();
	const session = driver.session();
	try {
	const result = await session.run(
		'CREATE (p:Position {name: $name, perspective: $perspective}) RETURN p',
		{ name, perspective }
	);
	const position = result.records[0].get('p').properties;
	return NextResponse.json(position);
	} finally {
	await session.close();
	}
}
