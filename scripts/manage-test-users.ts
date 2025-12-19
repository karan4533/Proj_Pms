/**
 * Manage Role-Based Test Users
 * 
 * Create, update, or delete test users with specific roles
 * Usage:
 *   npm run manage:test-users create          - Create all test users
 *   npm run manage:test-users delete          - Delete all test users
 *   npm run manage:test-users delete:manager  - Delete only manager
 *   npm run manage:test-users reset           - Delete and recreate all
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, inArray } from "drizzle-orm";
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL not found");
  process.exit(1);
}

// Create database connection
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

import { users, members, workspaces } from "@/db/schema";
import { MemberRole } from "@/features/members/types";

interface RoleBasedUser {
  name: string;
  email: string;
  password: string;
  role: MemberRole;
  description: string;
}

const roleBasedUsers: RoleBasedUser[] = [
  {
    name: "Test Admin User",
    email: "admin@test.pms",
    password: "admin123",
    role: MemberRole.ADMIN,
    description: "Full system control - can do everything"
  },
  {
    name: "Test Project Manager",
    email: "manager@test.pms",
    password: "manager123",
    role: MemberRole.PROJECT_MANAGER,
    description: "Manages projects and teams"
  },
  {
    name: "Test Team Lead",
    email: "teamlead@test.pms",
    password: "teamlead123",
    role: MemberRole.TEAM_LEAD,
    description: "Leads team, manages tasks"
  },
  {
    name: "Test Employee",
    email: "employee@test.pms",
    password: "employee123",
    role: MemberRole.EMPLOYEE,
    description: "Works on assigned tasks"
  },
  {
    name: "Test Management User",
    email: "management@test.pms",
    password: "management123",
    role: MemberRole.MANAGEMENT,
    description: "Read-only access for reporting"
  }
];

async function createUsers() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          Creating Role-Based Test Users                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Get existing workspaces
    const existingWorkspaces = await db.select().from(workspaces);
    
    if (existingWorkspaces.length === 0) {
      console.error("❌ No workspaces found. Please create at least one workspace first.");
      process.exit(1);
    }

    const testWorkspace = existingWorkspaces[0];
    console.log(`📁 Using workspace: "${testWorkspace.name}" (${testWorkspace.id})\n`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const userData of roleBasedUsers) {
      console.log(`\n👤 Processing: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        console.log(`   ⚠️  User exists, updating password and role...`);
        userId = existingUser[0].id;
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await db
          .update(users)
          .set({ 
            password: hashedPassword,
            name: userData.name 
          })
          .where(eq(users.id, userId));
        
        updatedCount++;
      } else {
        console.log(`   ✨ Creating new user...`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const [newUser] = await db
          .insert(users)
          .values({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
          })
          .returning();
        
        userId = newUser.id;
        createdCount++;
      }

      // Check if member exists in workspace
      const existingMember = await db
        .select()
        .from(members)
        .where(eq(members.userId, userId))
        .limit(1);

      if (existingMember.length > 0) {
        console.log(`   🔄 Updating role to ${userData.role}...`);
        await db
          .update(members)
          .set({ role: userData.role })
          .where(eq(members.id, existingMember[0].id));
      } else {
        console.log(`   ➕ Adding to workspace as ${userData.role}...`);
        await db
          .insert(members)
          .values({
            userId: userId,
            workspaceId: testWorkspace.id,
            role: userData.role,
          });
      }

      console.log(`   ✅ Complete!`);
    }

    console.log("\n\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Summary                                ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    console.log(`  ✨ New users created: ${createdCount}`);
    console.log(`  🔄 Existing users updated: ${updatedCount}`);

    console.log("\n\n╔════════════════════════════════════════════════════════════╗");
    console.log("║              🔐 Login Credentials                         ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    roleBasedUsers.forEach((user) => {
      const roleEmoji = getRoleEmoji(user.role);
      console.log(`  ${roleEmoji} ${user.role}`);
      console.log(`     Email:    ${user.email}`);
      console.log(`     Password: ${user.password}`);
      console.log(``);
    });

  } catch (error) {
    console.error("\n❌ Error creating users:", error);
    throw error;
  }
}

async function deleteUsers(roleFilter?: string) {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          Deleting Role-Based Test Users                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    let usersToDelete = roleBasedUsers;

    // Filter by specific role if provided
    if (roleFilter) {
      const roleMap: Record<string, MemberRole> = {
        'admin': MemberRole.ADMIN,
        'manager': MemberRole.PROJECT_MANAGER,
        'pm': MemberRole.PROJECT_MANAGER,
        'teamlead': MemberRole.TEAM_LEAD,
        'tl': MemberRole.TEAM_LEAD,
        'employee': MemberRole.EMPLOYEE,
        'management': MemberRole.MANAGEMENT,
      };

      const targetRole = roleMap[roleFilter.toLowerCase()];
      if (!targetRole) {
        console.error(`❌ Unknown role: ${roleFilter}`);
        console.log(`   Valid roles: admin, manager/pm, teamlead/tl, employee, management`);
        process.exit(1);
      }

      usersToDelete = roleBasedUsers.filter(u => u.role === targetRole);
      console.log(`🎯 Targeting ${targetRole} users only\n`);
    }

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const userData of usersToDelete) {
      console.log(`\n🗑️  Deleting: ${userData.name} (${userData.email})`);

      // Find user
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length === 0) {
        console.log(`   ⚠️  User not found, skipping...`);
        notFoundCount++;
        continue;
      }

      const userId = existingUser[0].id;

      // Delete member records first (foreign key constraint)
      const deletedMembers = await db
        .delete(members)
        .where(eq(members.userId, userId))
        .returning();

      console.log(`   🔗 Removed from ${deletedMembers.length} workspace(s)`);

      // Delete user
      await db
        .delete(users)
        .where(eq(users.id, userId));

      console.log(`   ✅ Deleted!`);
      deletedCount++;
    }

    console.log("\n\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Summary                                ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    console.log(`  🗑️  Users deleted: ${deletedCount}`);
    console.log(`  ⚠️  Users not found: ${notFoundCount}`);

  } catch (error) {
    console.error("\n❌ Error deleting users:", error);
    throw error;
  }
}

async function resetUsers() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          Resetting Role-Based Test Users                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  await deleteUsers();
  console.log("\n\n⏳ Recreating users...\n");
  await createUsers();
}

function getRoleEmoji(role: string): string {
  const emojiMap: Record<string, string> = {
    'ADMIN': '👑',
    'PROJECT_MANAGER': '📊',
    'TEAM_LEAD': '🎯',
    'EMPLOYEE': '👷',
    'MANAGEMENT': '📈',
  };
  return emojiMap[role] || '❓';
}

function showHelp() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          Manage Test Users - Help                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  console.log("Usage: npm run manage:test-users [command] [role]\n");
  console.log("Commands:");
  console.log("  create              Create/update all test users");
  console.log("  delete              Delete all test users");
  console.log("  delete:admin        Delete only admin user");
  console.log("  delete:manager      Delete only project manager");
  console.log("  delete:teamlead     Delete only team lead");
  console.log("  delete:employee     Delete only employee");
  console.log("  delete:management   Delete only management user");
  console.log("  reset               Delete and recreate all users");
  console.log("  help                Show this help message\n");
  console.log("Examples:");
  console.log("  npm run manage:test-users create");
  console.log("  npm run manage:test-users delete:manager");
  console.log("  npm run manage:test-users reset\n");
}

async function main() {
  const command = process.argv[2] || 'help';

  try {
    if (command === 'create') {
      await createUsers();
    } else if (command === 'delete') {
      await deleteUsers();
    } else if (command.startsWith('delete:')) {
      const role = command.split(':')[1];
      await deleteUsers(role);
    } else if (command === 'reset') {
      await resetUsers();
    } else if (command === 'help' || command === '--help' || command === '-h') {
      showHelp();
    } else {
      console.error(`\n❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
    }

    await client.end();
    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    await client.end();
    process.exit(1);
  }
}

main();
