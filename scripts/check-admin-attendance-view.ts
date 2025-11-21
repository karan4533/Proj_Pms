import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const { attendance, users, members } = schema;

config({ path: '.env.local' });

async function checkAdminView() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    console.log('🔍 Checking admin view for Varun...\n');

    // Find Varun's user
    const varun = await db.query.users.findFirst({
      where: eq(users.email, 'varun@pms.com'),
    });

    if (!varun) {
      console.log('❌ Varun user not found!');
      await client.end();
      return;
    }

    console.log(`✅ Found Varun: ${varun.name} (${varun.email})`);
    console.log(`   User ID: ${varun.id}\n`);

    // Check if Varun is admin
    const adminMember = await db.query.members.findFirst({
      where: and(
        eq(members.userId, varun.id),
        eq(members.role, 'ADMIN')
      ),
    });

    if (!adminMember) {
      console.log('❌ Varun is NOT an admin in any workspace!');
      await client.end();
      return;
    }

    console.log(`✅ Varun is ADMIN in workspace: ${adminMember.workspaceId}\n`);

    // Now simulate what the API endpoint does
    console.log('🔍 Simulating /api/attendance/records endpoint...\n');

    const records = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        userName: users.name,
        userEmail: users.email,
        projectId: attendance.projectId,
        shiftStartTime: attendance.shiftStartTime,
        shiftEndTime: attendance.shiftEndTime,
        totalDuration: attendance.totalDuration,
        endActivity: attendance.endActivity,
        dailyTasks: attendance.dailyTasks,
        status: attendance.status,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .where(eq(attendance.status, 'COMPLETED'))
      .orderBy(desc(attendance.shiftStartTime));

    console.log(`📊 API would return: ${records.length} records\n`);

    if (records.length > 0) {
      console.log('Sample records (first 3):');
      records.slice(0, 3).forEach((record, i) => {
        console.log(`\n${i + 1}. ${record.userName} (${record.userEmail})`);
        console.log(`   Start: ${record.shiftStartTime}`);
        console.log(`   End: ${record.shiftEndTime}`);
        console.log(`   Duration: ${record.totalDuration || 'NULL'} minutes`);
        console.log(`   Tasks: ${record.dailyTasks ? JSON.stringify(record.dailyTasks) : 'NULL'}`);
        console.log(`   End Activity: ${record.endActivity || 'NULL'}`);
      });
      
      console.log('\n\n✅ Data exists and should be visible to admin!');
      console.log('📝 Response structure that frontend receives:');
      console.log(JSON.stringify({ data: records.slice(0, 2) }, null, 2));
    } else {
      console.log('⚠️  No COMPLETED records found!');
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await client.end();
    process.exit(1);
  }
}

checkAdminView();
