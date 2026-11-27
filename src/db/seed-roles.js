import { closeDb, connectToDb } from './connect.js';
import roles from './seeds/roles.json' with { type: 'json' };

try {
    const db = await connectToDb();
    const rolesCollection = db.collection('roles');

    for (const role of roles) {
        await rolesCollection.updateOne(
            { name: role.name },
            { $setOnInsert: role },
            { upsert: true }
        );
    }

    console.log('Standard roles are available.');
} finally {
    await closeDb();
}
