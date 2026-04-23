import { NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

export async function GET() {
	const session = driver.session();
	try {
		const result = await session.run(
			`MATCH (d:Discipline)
			RETURN d
			ORDER BY d.discipline`
		);
		const contexts = result.records.map(r => r.get('d').properties);
		return NextResponse.json(contexts);
	} finally {
		await session.close();
	}
}