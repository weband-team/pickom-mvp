# New Task - Onboarding

You are given the following context:
$ARGUMENTS

## Instructions
"AI models are geniuses who start from scratch on every task." - Noam Brown

Your job is to "onboard" yourself to the current task.

### Steps:

1. **Create Task ID**:
   - Generate a unique task ID based on the task description
   - Format: `[category]-[date]-[short-name]` (e.g., `ui-2025-01-30-profile-page`)
   - Create directory: `.claude/tasks/[TASK_ID]/`

2. **Explore & Research**:
   - Use ultrathink to understand the task
   - Explore the codebase for relevant files
   - Identify dependencies and related components
   - Ask clarifying questions if needed

3. **Create Onboarding Document**:
   - Create `.claude/tasks/[TASK_ID]/onboarding.md`
   - Use the following template:

```markdown
# Task: [Task Title]

**Task ID**: [TASK_ID]
**Created**: [Date]
**Status**: 🟡 In Progress

## 📋 Task Description

[Clear description of what needs to be done]

## 🎯 Goals & Success Criteria

- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## 📁 Relevant Files

- `path/to/file1.ts` - [description]
- `path/to/file2.tsx` - [description]

## 🔍 Context & Research

[Information gathered from exploring codebase]

### Key Dependencies
- Dependency 1
- Dependency 2

### Related Components
- Component 1
- Component 2

## 📝 Implementation Plan

1. Step 1
2. Step 2
3. Step 3

## 🧪 Testing Instructions

### Manual Testing
- [ ] Test case 1
- [ ] Test case 2

### Automated Testing
- [ ] Unit tests
- [ ] Integration tests

## 🔖 Checkpoints

[Checkpoints will be added here using /bookmark command]
```

4. **Create Todos**:
   - AFTER completing the onboarding document, create TodoWrite entries
   - Break down the implementation plan into actionable todos

5. **Confirm with user**:
   - Show the created task structure
   - Ask if anything needs to be adjusted before starting

The goal is to get you fully prepared to start working on the task.
Take as long as you need to get yourself ready. Overdoing it is better than underdoing it.

IMPORTANT:
- Save the onboarding.md file as soon as you have enough information
- Update this file as you discover new information
- This file will be used to onboard you in future sessions
- Create your todos AFTER creation of the comprehensive onboarding document