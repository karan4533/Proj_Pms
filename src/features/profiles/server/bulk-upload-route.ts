import { Hono } from "hono";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono().post("/", sessionMiddleware, async (c) => {
  const user = c.get("user");

  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "File size exceeds 10MB limit" }, 400);
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let workbook: XLSX.WorkBook;
    
    // Parse based on file type
    if (file.name.endsWith(".csv")) {
      const csvData = buffer.toString("utf-8");
      workbook = XLSX.read(csvData, { type: "string" });
    } else {
      workbook = XLSX.read(buffer, { type: "buffer" });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return c.json({ error: "File is empty" }, 400);
    }

    if (jsonData.length > 100) {
      return c.json({ error: "Maximum 100 profiles per upload" }, 400);
    }

    const profiles = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row: any = jsonData[i];
      
      // Skip empty rows
      if (!row.name || !row.email || !row.password) {
        errors.push(`Row ${i + 2}: Missing required fields (name, email, password)`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${i + 2}: Invalid email format`);
        continue;
      }

      // Validate password length
      if (row.password.length < 6) {
        errors.push(`Row ${i + 2}: Password must be at least 6 characters`);
        continue;
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(row.password, 10);

        // Parse skills if present
        let skills = null;
        if (row.skills && typeof row.skills === "string") {
          const skillsArray = row.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
          if (skillsArray.length > 0) {
            skills = skillsArray;
          }
        }

        // Parse dates
        let dateOfBirth = null;
        if (row.date_of_birth) {
          const dob = new Date(row.date_of_birth);
          if (!isNaN(dob.getTime())) {
            dateOfBirth = dob;
          }
        }

        let dateOfJoining = null;
        if (row.date_of_joining) {
          const doj = new Date(row.date_of_joining);
          if (!isNaN(doj.getTime())) {
            dateOfJoining = doj;
          }
        }

        const profileData: any = {
          name: row.name,
          email: row.email.toLowerCase(),
          password: hashedPassword,
          mobileNo: row.mobile_no || null,
          native: row.native || null,
          designation: row.designation || null,
          department: row.department || null,
          experience: row.experience ? parseInt(row.experience) : null,
          dateOfBirth,
          dateOfJoining,
        };

        // Only add skills if we have valid skills
        if (skills) {
          profileData.skills = skills;
        }

        profiles.push(profileData);
      } catch (error) {
        errors.push(`Row ${i + 2}: Error processing data`);
      }
    }

    if (profiles.length === 0) {
      return c.json({ error: "No valid profiles to insert", details: errors }, 400);
    }

    // Insert profiles in batch
    try {
      const insertedProfiles = await db.insert(users).values(profiles).returning();

      return c.json({
        success: true,
        count: insertedProfiles.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        return c.json({ error: "One or more email addresses already exist", details: errors }, 409);
      }
      throw error;
    }
  } catch (error) {
    console.error("Bulk upload error:", error);
    return c.json({ error: "Failed to process file" }, 500);
  }
});

export default app;
