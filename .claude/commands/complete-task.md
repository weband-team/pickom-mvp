# Complete Task

You are given the following context:
$ARGUMENTS

## Instructions

Mark a task as completed and create a final summary.

### Steps:

1. **Find task**:
   - Use the provided task ID or find the most recent active task
   - Navigate to `.claude/tasks/[TASK_ID]/`

2. **Update status**:
   - Read the `onboarding.md` file
   - Update status from 🟡 In Progress to ✅ Completed
   - Add completion date

3. **Create completion summary**:
   - Add a final checkpoint with:
     - What was accomplished
     - Files created/modified
     - Testing results
     - Any notes for future reference

4. **Verify completion**:
   - Check that all goals/success criteria are met
   - Run any relevant tests
   - Ask user to confirm completion

### Format for completion section:
```markdown
## ✅ Task Completed

**Completed Date**: [YYYY-MM-DD]

### 🎉 Accomplishments
- Achievement 1
- Achievement 2
- Achievement 3

### 📂 Files Changed
- path/to/file1.ts - Created/Modified
- path/to/file2.tsx - Created/Modified

### ✅ All Goals Met
- [x] Goal 1
- [x] Goal 2
- [x] Goal 3

### 🧪 Testing Status
- [x] Manual testing passed
- [x] All tests passing

### 📝 Final Notes
[Any important notes for future reference]
```

5. **Archive (optional)**:
   - Ask if user wants to move task to `archived/` subdirectory

IMPORTANT:
- Ensure all success criteria are checked
- Get user confirmation before marking as complete
- Preserve all checkpoint history