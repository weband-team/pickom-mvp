# Open Task

You are given the following context:
$ARGUMENTS

## Instructions

Open and display a specific task's details.

### Steps:

1. **Parse arguments**:
   - Task ID should be provided as argument (e.g., `/open-task mobile-port-001`)
   - If no ID provided, show list of available tasks and ask user to specify

2. **Read task files**:
   - Navigate to `.claude/tasks/[TASK_ID]/`
   - Read `onboarding.md` file
   - Check for any other related files in the task directory

3. **Display task details**:
   - Show the full onboarding document
   - Highlight the latest checkpoint/bookmark
   - Show current status
   - List all checkpoints with timestamps

4. **Prepare for work**:
   - Summarize the task state
   - Show what needs to be done next
   - Ask if the user wants to continue working on this task

### Format:
```
📂 Task: [Task ID]
═══════════════════════════════════

[Full onboarding.md content]

═══════════════════════════════════
📌 Latest Checkpoint: [Date]
Next steps: [Summary from latest checkpoint]

Ready to continue? (y/n)
```

IMPORTANT: If task ID doesn't exist, list available tasks and ask user to choose one.