import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { users, workspaces, members } from '../src/db/schema.js';
import { eq, ne } from 'drizzle-orm';

config({ path: '.env.local' });

async function createAdminUser() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  try {
    console.log('🔧 Creating admin user: Varun\n');

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, 'varun@pms.com'));
    
    if (existingUser.length > 0) {
      console.log('⚠️  User varun@pms.com already exists!');
      console.log('User ID:', existingUser[0].id);
      console.log('Name:', existingUser[0].name);
      
      // Make this user admin in all workspaces
      const allWorkspaces = await db.select().from(workspaces);
      console.log(`\n📋 Found ${allWorkspaces.length} workspaces\n`);
      
      for (const workspace of allWorkspaces) {
        // Check if member exists
        const existingMember = await db.select()
          .from(members)
          .where(eq(members.userId, existingUser[0].id))
          .where(eq(members.workspaceId, workspace.id));
        
        if (existingMember.length === 0) {
          // Add as admin
          await db.insert(members).values({
            userId: existingUser[0].id,
            workspaceId: workspace.id,
            role: 'ADMIN',
          });
          console.log(`✅ Added Varun as ADMIN to workspace: ${workspace.name}`);
        } else {
          // Update to admin if not already
          if (existingMember[0].role !== 'ADMIN') {
            await db.update(members)
              .set({ role: 'ADMIN', updatedAt: new Date() })
              .where(eq(members.id, existingMember[0].id));
            console.log(`✅ Updated Varun to ADMIN in workspace: ${workspace.name}`);
          } else {
            console.log(`✓ Varun is already ADMIN in workspace: ${workspace.name}`);
          }
        }
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const [newUser] = await db.insert(users).values({
        name: 'Varun',
        email: 'varun@pms.com',
        password: hashedPassword,
        designation: 'System Administrator',
        department: 'Management',
        experience: 10,
        dateOfJoining: new Date('2020-01-01'),
        skills: ['Management', 'System Administration', 'Project Oversight'],
      }).returning();

      console.log('✅ Admin user created successfully!\n');
      console.log('User ID:', newUser.id);
      console.log('Name:', newUser.name);
      console.log('Email:', newUser.email);
      
      // Add to all existing workspaces as ADMIN
      const allWorkspaces = await db.select().from(workspaces);
      console.log(`\n📋 Adding to ${allWorkspaces.length} workspaces as ADMIN\n`);
      
      for (const workspace of allWorkspaces) {
        await db.insert(members).values({
          userId: newUser.id,
          workspaceId: workspace.id,
          role: 'ADMIN',
        });
        console.log(`✅ Added to workspace: ${workspace.name}`);
      }
    }

    console.log('\n🔑 Admin Login Credentials:');
    console.log('Email: varun@pms.com');
    console.log('Password: admin123');
    console.log('\n✅ Admin setup complete!\n');

    // Now update all other users to EMPLOYEE or MEMBER role
    console.log('📝 Updating other users to EMPLOYEE role...\n');
    
    const allUsers = await db.select().from(users).where(ne(users.email, 'varun@pms.com'));
    
    for (const user of allUsers) {
      const userMembers = await db.select()
        .from(members)
        .where(eq(members.userId, user.id));
      
      for (const member of userMembers) {
        if (member.role === 'ADMIN' || member.role === 'PROJECT_MANAGER' || member.role === 'MANAGEMENT') {
          await db.update(members)
            .set({ role: 'EMPLOYEE', updatedAt: new Date() })
            .where(eq(members.id, member.id));
          console.log(`✅ Updated ${user.name} to EMPLOYEE role`);
        }
      }
    }

    console.log('\n✅ All users updated! Only Varun has admin access.\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createAdminUser();
