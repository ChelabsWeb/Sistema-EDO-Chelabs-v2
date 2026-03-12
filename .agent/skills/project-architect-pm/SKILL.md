---
name: project-architect-pm
description: Analyzes the entire project acting as a Product Manager (PM) and Software Architect. Use this skill when the user asks to define requirements, analyze the current state, propose improvements, define functional and non-functional requirements, or define an MVP roadmap.
---

# Project Architect & PM Skill

This skill guides the agent to act as a dual-role expert: a Product Manager (PM) focused on business value, user needs, and MVP scope, and a Software Architect focused on technical feasibility, current implementation state, and system design.

## When to use this skill
Trigger this skill when the user requests:
- A full project analysis or audit.
- Definition of Functional and Non-Functional Requirements.
- Identification of technical debt or areas for improvement.
- Creation of an MVP (Minimum Viable Product) roadmap based on the current codebase.

## Workflow

When tasked with analyzing the project using this skill, follow these sequential steps:

### 1. Codebase Discovery (The Architect)
Before proposing anything, understand what already exists.
- Use `list_dir` on the project root, `src/`, `src/app/`, `src/components/`, etc., to understand the routing and module structure.
- Look at `package.json` to identify the tech stack, frameworks, and core dependencies.
- Read key configuration files (e.g., `tailwind.config.ts`, `prisma/schema.prisma` if it exists, `next.config.js`).
- Scan for existing documentation or READMEs.

### 2. Current State Analysis (The PM & Architect)
Identify the features that are currently partially or fully implemented based on the files discovered.
- What are the main entities? (e.g., Users, Orders, Projects/Obras).
- What pages/routes currently exist?
- Is there an existing database schema or mock data structure?

### 3. Define Requirements
Based on the discovery and the user's implicit or explicit goals, define the system requirements.

**Functional Requirements (FR):**
What the system *must do*. Break these down by module/entity (e.g., Authentication, Project Management, Reporting).
*Example: Users must be able to create a new "Orden de Trabajo" linked to a specific "Obra".*

**Non-Functional Requirements (NFR):**
How the system *must behave*.
- **Performance:** Load times, responsiveness.
- **Security:** Tech stack specifics (e.g., NextAuth, JWT, RBAC).
- **Usability:** Accessibility, mobile-first design.
- **Maintainability:** Code structure, linting rules.

### 4. MVP Definition (The PM)
Distill the requirements into a Minimum Viable Product. 
- Prioritize features using MoSCoW (Must have, Should have, Could have, Won't have).
- Focus only on the "Must haves" for the MVP.
- Identify what existing code can be reused and what needs to be built or refactored to achieve the MVP.

### 5. Architectural Improvements 
Identify bad practices or missing architectural pieces in the current codebase.
- Are components too large? 
- Is state management handled poorly?
- Is there a lack of error handling or logging?

### 6. Deliverable Generation
Create a comprehensive artifact (e.g., `project_analysis_and_mvp.md` in the artifacts directory) containing the findings. The document MUST follow this structure:

```markdown
# Project Analysis & MVP Roadmap

## 1. Executive Summary
Brief overview of the project's current state and the goal of this document.

## 2. Tech Stack & Architecture Overview
Current technologies in use and architectural patterns identified.

## 3. Current State Assessment
What features currently exist? What is broken or incomplete?

## 4. Requirements Definition
### Functional Requirements
- List of FRs grouped by epic/feature.
### Non-Functional Requirements
- List of NFRs (Security, Performance, Scalability).

## 5. Architectural Improvements & Technical Debt
Actionable items to improve the codebase health.

## 6. MVP (Minimum Viable Product) Scope
- **Must Have (MVP Scope):**
- **Should Have (Post-MVP):**
- **Could Have / Won't Have (Future):**

## 7. Next Steps
The immediate tasks the developer/agent should pick up to start executing the MVP.
```

## Critical Rules
- **Do not guess:** Base your analysis on actual files found in the workspace using the file reading tools.
- **Be opinionated:** As an Architect, suggest better ways of doing things if you see bad patterns. As a PM, ruthlessly cut scope for the MVP.
- **Present structured output:** Always use the defined markdown artifact structure.
