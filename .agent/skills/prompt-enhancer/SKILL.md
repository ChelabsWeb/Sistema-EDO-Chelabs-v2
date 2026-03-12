---
name: prompt-enhancer
description: Enhances and optimizes prompts specifically for Gemini 3.1 Pro. Use this skill when the user asks you to improve, refine, or rewrite a prompt to get the best possible results from Gemini 3.1 Pro.
---

# Prompt Enhancer (for Gemini 3.1 Pro)

This skill provides the best practices and a standardized framework for writing and refining prompts optimized for Gemini 3.1 Pro.

## When to use this skill
Use this skill whenever you need to rewrite a user's prompt or generate a new prompt to ensure Gemini 3.1 Pro understands the task perfectly and provides the highest quality output.

## Core Principles for Gemini 3.1 Pro

Gemini 3.1 Pro thrives on structure, clear delimiters, comprehensive context, and specific constraints. 

1.  **Use XML Constraints / Delimiters:** Gemini 3.1 Pro is highly responsive to XML-style tags for structuring input. Use them to clearly delineate different parts of the prompt.
    *   `<role>`: Define the persona.
    *   `<context>`: Provide background information.
    *   `<task>` or `<instructions>`: The core request.
    *   `<examples>`: Few-shot examples (highly effective).
    *   `<format>`: The specific output structure.
    *   `<constraints>`: Rules the model MUST follow.

2.  **Be Explicit and Direct:** Do not use polite filler words. State exactly what you need. Use strong verbs like "Write," "Analyze," "Extract," "Format."

3.  **Provide Context Before the Task:** Give the model the "why" and "what" before asking it to do the "how."

4.  **Few-Shot Prompting:** Provide 1-3 examples of the desired input-to-output mapping. This reduces ambiguity drastically.

5.  **Chain of Thought (CoT):** For complex reasoning tasks, explicitly tell the model to think step-by-step.
    *   *Example:* `First, analyze the problem within <thinking> tags. Then, provide the final answer in the <answer> tags.`

6.  **Specify Output Format:** Never leave the format ambiguous. If you want JSON, provide a JSON schema. If you want a table, specify the columns.

## The Prompt Enhancement Framework

When asked to enhance a prompt, rewrite it using the following structure:

```xml
<role>
[Define the expert persona Gemini should adopt. e.g., "You are a Senior Security Engineer specializing in React applications."]
</role>

<context>
[Provide all necessary background information. What is the project? Who is the audience? What is the current state?]
</context>

<instructions>
[State the task clearly. Break it down into numbered steps if it's complex.]
1. First step...
2. Second step...
</instructions>

<constraints>
[List absolute rules the model must not break.]
- rule 1
- rule 2
</constraints>

<examples>
[Provide Input/Output examples if applicable to the task]
<example>
<input>...</input>
<output>...</output>
</example>
</examples>

<format>
[Define exactly how the output should look. Use markdown, JSON schemas, or plain text templates.]
</format>
```

## Enhancement Workflow

When a user gives you a raw prompt:
1.  **Analyze:** What is the core goal of the user's prompt? What context is missing? Is the output format clear? Does it require reasoning?
2.  **Deconstruct & Map:** Map the user's raw prompt into the XML framework defined above.
3.  **Flesh Out Details:** Add a professional persona. Invent reasonable context if none was provided (or ask the user to fill it in). Add specific format constraints.
4.  **Review against Principles:** Does it use clear delimiters? Is it direct? Does it ask for step-by-step thinking if the task is complex?
5.  **Present:** Show the user the enhanced prompt.
