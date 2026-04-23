import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import neo4j from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';

const driver = neo4j.driver(
	process.env.NEO4J_URI as string,
	neo4j.auth.basic(
		process.env.NEO4J_USER as string,
		process.env.NEO4J_PASSWORD as string
	)
);

async function seed() {
	const DISCIPLINES = ['bjj', 'mma', 'wrestling', 'judo'];
	const session = driver.session();
	try {
		console.log('Seeding DisciplineContext nodes...');
		for (const discipline of DISCIPLINES) {
			await session.run(
				`MERGE (d:DisciplineContext {discipline: $discipline})
				ON CREATE SET d.id = $id`,
				{ id: uuidv4(), discipline }
			);
			console.log(`  Created: ${discipline} `);
		}
		console.log('Seed complete.');
	} finally {
		await session.close();
		await driver.close();
	}
}

seed().catch(console.error);
