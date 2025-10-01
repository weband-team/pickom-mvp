# Bookmark - Save Task Progress

You are given the following context:
$ARGUMENTS

## Instructions

Save the current progress of the active task as a bookmark checkpoint.

### Steps:

1. **Find active task**:
   - Look for the most recently modified directory in `.claude/tasks/`
   - Read the `onboarding.md` file to understand the task

2. **Create bookmark entry**:
   - Add a new bookmark section to the task's `onboarding.md` file
   - Include:
     - Timestamp (date and time)
     - Current status/stage
     - What was completed
     - What's next
     - Important notes or blockers
     - Files modified (check git status)

3. **Format**:
   ```markdown
   ## 🔖 Checkpoint: [YYYY-MM-DD HH:MM]

   **Status**: [In Progress / Blocked / Ready for Review]

   ### ✅ Completed
   - Item 1
   - Item 2

   ### 📝 Next Steps
   - Step 1
   - Step 2

   ### 📂 Modified Files
   - path/to/file1.ts
   - path/to/file2.tsx

   ### 💡 Notes
   - Important note 1
   - Important note 2
   ```

4. **Confirm**:
   - Show the user what was bookmarked
   - Provide a summary of the checkpoint

IMPORTANT: If no active task is found, ask the user to specify the task ID or create a new task first with `/new-task`.