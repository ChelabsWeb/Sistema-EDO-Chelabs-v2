---
name: skill-creator
description: Helps you create new skills correctly for the Antigravity agent. Use this skill when the user asks you to create a new skill or modify an existing skill.
---
# Skill Creator

This skill guides you through the process of creating or modifying skills for the Antigravity agent.

## What is a Skill?
Skills are reusable packages of knowledge that extend an agent's capabilities. They consist of a folder containing a `SKILL.md` file with instructions, best practices, and optional scripts or resources.

## Where to Create Skills
1. **Workspace-specific:** `<workspace-root>/.agent/skills/<skill-folder>/`
2. **Global:** `~/.gemini/antigravity/skills/<skill-folder>/`

## Skill Structure
1. Create a directory (lowercase, hyphens for spaces).
2. Create a `SKILL.md` file inside.
3. Start with YAML frontmatter:

```yaml
---
name: your-skill-name
description: Clear, third-person description of what the skill does.
---
```

## Best Practices
- **Focus:** One specific task or context.
- **Clarity:** Highly descriptive `description`.
- **Black Box Scripts:** Use scripts with `--help`.
- **Decision Trees:** Provide clear logic for complex tasks.

## Why this is a good skill:
1. **Clear Trigger**: The description explicitly tells the agent when to use it (during skill creation/modification).
2. **Standardized Structure**: It enforces the same folder and metadata structure described in the official docs.
3. **Actionable Instructions**: It provides a concrete checklist (create directory, create file, add frontmatter).
