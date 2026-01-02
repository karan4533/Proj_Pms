import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

const { attendance, users } = schema;

config({ path: '.env.local' });

async function checkAttendanceData() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  try {
    console.log("🔍 Checking attendance data...\n");

    // Get all attendance records
    const allRecords = await db.query.attendance.findMany({
      orderBy: [desc(attendance.createdAt)],
      limit: 10,
    });

    console.log(`📊 Total recent attendance records: ${allRecords.length}\n`);

    if (allRecords.length > 0) {
      console.log("Recent records:");
      allRecords.forEach((record, i) => {
        console.log(`\n${i + 1}. Record ID: ${record.id}`);
        console.log(`   User ID: ${record.userId}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Start: ${record.shiftStartTime}`);
        console.log(`   End: ${record.shiftEndTime || 'Not ended'}`);
        console.log(`   Duration: ${record.totalDuration || 'N/A'} minutes`);
      });
    }

    // Get records with user info (like the admin endpoint does)
    console.log("\n\n🔍 Checking records with JOIN (admin view)...\n");
    
    const recordsWithUsers = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        userName: users.name,
        userEmail: users.email,
        shiftStartTime: attendance.shiftStartTime,
        shiftEndTime: attendance.shiftEndTime,
        totalDuration: attendance.totalDuration,
        status: attendance.status,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .where(eq(attendance.status, "COMPLETED"))
      .orderBy(desc(attendance.shiftStartTime))
      .limit(10);

    console.log(`📊 Completed records with user info: ${recordsWithUsers.length}\n`);

    if (recordsWithUsers.length > 0) {
      console.log("Completed records:");
      recordsWithUsers.forEach((record, i) => {
        console.log(`\n${i + 1}. ${record.userName} (${record.userEmail})`);
        console.log(`   Start: ${record.shiftStartTime}`);
        console.log(`   End: ${record.shiftEndTime}`);
        console.log(`   Duration: ${record.totalDuration} minutes`);
      });
    } else {
      console.log("⚠️  No COMPLETED records found!");
      console.log("Checking IN_PROGRESS records...\n");
      
      const inProgressRecords = await db.query.attendance.findMany({
        where: eq(attendance.status, "IN_PROGRESS"),
      });
      
      console.log(`IN_PROGRESS records: ${inProgressRecords.length}`);
      if (inProgressRecords.length > 0) {
        inProgressRecords.forEach((record, i) => {
          console.log(`\n${i + 1}. User ID: ${record.userId}`);
          console.log(`   Started: ${record.shiftStartTime}`);
        });
      }
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAttendanceData();
