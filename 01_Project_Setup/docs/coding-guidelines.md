# Coding Guidelines

## Purpose

These guidelines establish engineering standards for future implementation modules. They do not introduce frontend, backend, or application code in this setup module.

## General Standards

- Keep module boundaries clear and explicit.
- Prefer readable, boring code over clever abstractions.
- Validate inputs at system boundaries.
- Keep secrets out of source control.
- Write tests for critical behavior, data transformations, security-sensitive logic, and user-facing workflows.
- Use structured errors and avoid leaking sensitive internals to clients.
- Document public contracts and non-obvious decisions.

## TypeScript and Frontend Standards

- Use TypeScript for application code.
- Prefer typed API clients and shared contract definitions where appropriate.
- Build accessible components with keyboard support and semantic markup.
- Keep UI state local unless broader state management is justified.
- Avoid mixing API calls, presentation, and domain logic in a single component.

## Python and Backend Standards

- Use clear package boundaries for routing, services, data access, schemas, and infrastructure integrations.
- Prefer Pydantic models for request and response validation.
- Keep business logic outside route handlers.
- Use async patterns consistently when integrating with async frameworks or clients.
- Handle provider failures, timeouts, retries, and rate limits explicitly.

## AI Integration Standards

- Keep prompts versioned or traceable.
- Separate provider clients from domain orchestration.
- Store model inputs and outputs only when justified by product, debugging, compliance, or user value.
- Redact sensitive data from logs.
- Evaluate generated content for safety, correctness, and consistency where appropriate.

## Testing Standards

- Unit tests should cover isolated logic.
- Integration tests should cover API contracts, database behavior, and provider boundaries.
- End-to-end tests should cover the most important user workflows.
- Security-sensitive behavior should include negative test cases.
- Test data must not contain real resumes, credentials, private conversations, or personal data.

## Documentation Standards

- Update README files when setup, commands, module responsibilities, or workflows change.
- Add ADRs for architectural decisions with lasting impact.
- Keep changelog entries focused on meaningful changes.
- Prefer concise docs that help future contributors make correct decisions quickly.
