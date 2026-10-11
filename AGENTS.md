# Architecture rules

- Keep asynchronous loading, empty, and error feedback in shared state components so daily flows remain visually consistent.
- Configure shared query freshness and retry behavior at the root, while domain-specific exceptions stay beside their data query.
- Keep all new database access in domain-oriented `data/` modules and expose each business domain through a public `index.ts`.
- Split any source file before editing it when it exceeds 400 lines to keep changes reviewable.