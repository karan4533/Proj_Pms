# Employee Management Scripts

## Create Employees

Creates all 12 employees with their details:

```bash
node -r esbuild-register create-employees.js
```

This will:
- Create all employees with default password: `Password@123`
- Generate `employee-user-mapping.json` with user IDs for CSV import
- Display all created user details

**Created Employees:**
1. Aakash Ravi Shankar Parashar - Software Engineer
2. Aishwarya Jeevan - UI/UX Designer
3. Arunraj - Senior Developer
4. Chandramohan Reddy - DevOps Engineer
5. Karthikeyan Saminathan - Team Lead
6. Rajkumar Patil - QA Engineer
7. Sathish Kumar P - Backend Developer
8. Vinoth Kumar Shanmugam - Full Stack Developer
9. Francis Xavier S - Project Manager
10. Arumugam Sivasubramaniyan - Database Administrator
11. Jayasurya Sudhakaran - Frontend Developer
12. Balumohan - Data Analyst

## Delete Employees

Delete all created employees and their related data:

```bash
node -r esbuild-register delete-employees.js CONFIRM
```

## Using with Bulk Import CSV

After creating employees, use `employee-user-mapping.json` to map users in your CSV:

```csv
Task Name,Project ID,Assignee Email,Status,Priority
"Implement Login","project-id-here","aakash.parashar@pms.com","TODO","HIGH"
"Design Dashboard","project-id-here","aishwarya.jeevan@pms.com","IN_PROGRESS","MEDIUM"
```

The mapping file contains:
- Employee name
- Email (use this in CSV)
- User ID (auto-generated)
- Department
- Designation

## Customize Employee Details

Edit `create-employees.js` to modify:
- Default password (line 20)
- Employee details (designation, department, skills, etc.)
- Date of joining
- Contact information
