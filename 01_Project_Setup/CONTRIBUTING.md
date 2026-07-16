# Contributing

Thank you for contributing to AI Interview Simulator. This project is organized as a sequence of focused modules, and every contribution should respect the scope of the active module.

## Contribution Principles

- Keep changes scoped to the module being implemented.
- Do not introduce application code in setup or documentation-only modules.
- Prefer simple, explicit architecture over premature abstraction.
- Document decisions that affect security, data ownership, user experience, infrastructure, or long-term maintainability.
- Treat privacy, interview data, resumes, voice data, and evaluation outputs as sensitive by default.

## Local Workflow

1. Create a branch from the latest stable project state.
2. Read the module README and relevant docs before making changes.
3. Make small, reviewable commits with clear messages.
4. Update documentation when behavior, architecture, or workflows change.
5. Run the relevant checks for the module before requesting review.

## Commit Message Style

Use concise, imperative commit messages.

Examples:

```text
Add project setup documentation
Define backend error handling guidelines
Document authentication module boundaries
```

## Pull Request Expectations

Each pull request should include:

- A clear summary of the change.
- The module or modules affected.
- Testing or verification performed.
- Any known risks, tradeoffs, or follow-up work.

## Review Standards

Reviewers should prioritize correctness, maintainability, security, privacy, test coverage, and alignment with module boundaries. Style feedback should reference documented conventions where possible.
