# 🎯 Customizable Batch ID Formats

## Current Implementation

Your CSV upload batch IDs are now **fully customizable**! You can choose from 4 different formats.

---

## 🔖 Available Formats

### **Option 1: Human-Readable** ✅ (Currently Active)

**Format**: `PROJECTNAME_YYYYMMDD_HHMMSS_XXX`

**Examples**:
```
BENZ_20251111_143052_A7B
SPINE_20251111_154323_K9M
ERP_SYSTEM_20251111_163045_P2Q
```

**Benefits**:
- ✅ Easy to identify project at a glance
- ✅ Sortable by date and time
- ✅ Unique with random suffix
- ✅ Human-readable in reports

**Use Case**: Perfect for organizations with multiple projects

---

### **Option 2: Sequential** 

**Format**: `BATCH_NNNNNN` (6-digit number)

**Examples**:
```
BATCH_000001
BATCH_000234
BATCH_012345
```

**Benefits**:
- ✅ Simple numeric sequence
- ✅ Easy to reference ("Upload batch 234")
- ✅ Sequential per project
- ✅ Shortest format

**Use Case**: Simple projects, easy verbal communication

**To Enable**:
```typescript
// In route.ts, line 569, replace:
const uploadBatchId = generateReadableBatchId(project.name);

// With:
const uploadBatchId = await generateSequentialBatchId(projectId);
```

---

### **Option 3: Custom (Project + User + Time)**

**Format**: `[PROJECT_CODE]-[USER_INITIALS]-[TIMESTAMP]`

**Examples**:
```
BNZ-AK-20251111143052  (Benz project, Admin Karanm)
SPN-JD-20251111154323  (Spine project, John Doe)
ERP-MJ-20251111163045  (ERP project, Mary Jane)
```

**Benefits**:
- ✅ Shows who uploaded
- ✅ Shows which project
- ✅ Includes precise timestamp
- ✅ Audit-friendly

**Use Case**: Compliance-heavy organizations, audit requirements

**To Enable**:
```typescript
// In route.ts, line 569, replace:
const uploadBatchId = generateReadableBatchId(project.name);

// With:
const uploadBatchId = generateCustomBatchId(project.name, user.name);
```

---

### **Option 4: UUID (Original)**

**Format**: Standard UUID v4

**Examples**:
```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

**Benefits**:
- ✅ Globally unique (zero collision chance)
- ✅ Database-optimized
- ✅ Industry standard
- ✅ No sequential prediction

**Use Case**: Maximum uniqueness, distributed systems

**To Enable**:
```typescript
// In route.ts, line 569, replace:
const uploadBatchId = generateReadableBatchId(project.name);

// With:
const uploadBatchId = crypto.randomUUID();
```

---

## 🎨 Creating Your Own Custom Format

You can create any format you want! Here are some ideas:

### **Format Idea 1: Department-Based**
```typescript
function generateDeptBatchId(dept: string, projectName: string): string {
  const timestamp = Date.now();
  const deptCode = dept.slice(0, 3).toUpperCase();
  const projectCode = projectName.slice(0, 3).toUpperCase();
  return `${deptCode}-${projectCode}-${timestamp}`;
}
// Example: ENG-BNZ-1699704672000
```

### **Format Idea 2: Location-Based**
```typescript
function generateLocationBatchId(location: string, projectName: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const locCode = location.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${locCode}_${projectName}_${date}_${random}`;
}
// Example: NYC_BENZ_20251111_A7K9
```

### **Format Idea 3: Client-Project Format**
```typescript
function generateClientBatchId(clientName: string, projectName: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const client = clientName.slice(0, 4).toUpperCase();
  const project = projectName.slice(0, 4).toUpperCase();
  return `${client}-${project}-${timestamp}`;
}
// Example: ACME-BENZ-04672000
```

---

## 📊 Comparison Table

| Format | Length | Readability | Sortable | Unique | Verbose |
|--------|--------|-------------|----------|--------|---------|
| **Human-Readable** | 26 chars | ⭐⭐⭐⭐⭐ | ✅ Yes | ✅ High | Medium |
| **Sequential** | 13 chars | ⭐⭐⭐⭐ | ✅ Yes | ⚠️ Per-project | Low |
| **Custom (Project+User)** | 23 chars | ⭐⭐⭐⭐⭐ | ✅ Yes | ✅ High | High |
| **UUID** | 36 chars | ⭐⭐ | ❌ No | ✅ Absolute | Low |

---

## 🔧 How to Change Format

**Step 1**: Open `src/features/tasks/server/route.ts`

**Step 2**: Find line ~569 (after "Get project to verify it exists")

**Step 3**: Replace the active line:

```typescript
// Currently active (Option 1):
const uploadBatchId = generateReadableBatchId(project.name);

// Change to Option 2 (Sequential):
const uploadBatchId = await generateSequentialBatchId(projectId);

// Change to Option 3 (Custom):
const uploadBatchId = generateCustomBatchId(project.name, user.name);

// Change to Option 4 (UUID):
const uploadBatchId = crypto.randomUUID();
```

**Step 4**: Save and restart server:
```bash
npm run dev
```

---

## 💡 Recommendation

For **1000+ user organization**, I recommend:

**Primary**: **Option 1 (Human-Readable)** ✅
- Easy for project managers to identify
- Sortable in reports
- Good for dashboards

**Alternative**: **Option 3 (Custom with User)** 
- Better for audit trails
- Shows accountability
- Good for compliance

**Avoid**: **Option 2 (Sequential)** for large orgs
- Can have collisions if multiple projects
- Less informative

---

## 📈 Real-World Examples

### Using Human-Readable Format:
```
Upload History:
- BENZ_20251111_143052_A7B (1,000 tasks)
- BENZ_20251111_154323_K9M (1,500 tasks)
- SPINE_20251111_163045_P2Q (2,000 tasks)
```

### Using Custom Format:
```
Upload History:
- BNZ-AK-20251111143052 (Admin Karanm uploaded 1,000 tasks)
- BNZ-JD-20251111154323 (John Doe uploaded 1,500 tasks)
- SPN-MJ-20251111163045 (Mary Jane uploaded 2,000 tasks)
```

---

## ✅ Testing Your Custom Format

After changing the format, test with a CSV upload:

```bash
# Upload a CSV file via the UI
# Check the console logs:

📤 CSV Upload request received
👤 User: admin@workspace.com
📁 File: sample-tasks.csv Size: 50000
🏢 Workspace: workspace_123
📊 Project: project_456
🔖 Upload Batch ID: BENZ_20251111_143052_A7B  ← Your custom format
✅ Created batch of 100 tasks (total: 1000)
```

---

## 🎯 Summary

✅ **4 built-in formats** available  
✅ **Currently using**: Human-Readable format  
✅ **Easy to switch**: Just change one line  
✅ **Fully customizable**: Create your own format  
✅ **Production-ready**: All formats tested  

**Current format is recommended for your 1000+ user organization!** 🚀
