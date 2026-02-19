# List Tasks

You are given the following context:
$ARGUMENTS

## Instructions

Display all tasks in the `.claude/tasks/` directory with their current status.

### Steps:

1. **Scan tasks directory**:
   - List all directories in `.claude/tasks/`
   - For each task, read its `onboarding.md` file

2. **Extract information**:
   - Task ID (directory name)
   - Task title (from onboarding.md first heading)
   - Status (look for status indicators or checkpoints)
   - Last modified date
   - Number of checkpoints/bookmarks

3. **Display format**:
   ```
   📋 Tasks Overview

   [Task ID] - [Title]
   Status: [Status]
   Last Updated: [Date]
   Checkpoints: [N]

   ---

   [Task ID] - [Title]
   Status: [Status]
   Last Updated: [Date]
   Checkpoints: [N]
   ```

4. **Sort by**:
   - Most recently modified first

IMPORTANT: If no tasks found, inform the user and suggest creating a new task with `/new-task`.