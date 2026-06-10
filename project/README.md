# DataPrep Studio - Project Memory

This folder stores project context, plans, decisions, and progress for DataPrep Studio.
When the product direction changes or a phase is completed, update the relevant files here so the project history remains easy to review later.

## How To Use

- `context/`: original idea, product description, MVP boundaries, and UI guidelines.
- `plans/`: active plans for each project phase.
- `plans/archive/`: old plan versions when a plan changes significantly.
- `status/`: current project state.
- `decisions/`: important product and technical decisions.
- `progress/`: progress log by date or milestone.
- `reports/`: detailed implementation reports for completed architecture milestones.

## Update Rules

- Do not overwrite old plans after major changes; copy the old version into `plans/archive/`.
- Each phase should have its own plan file under `plans/`.
- When a phase is completed, update `status/current-status.md` and `progress/progress-log.md`.
- Any decision that affects architecture or MVP scope should be recorded in `decisions/decision-log.md`.
