# UI Guidelines

Last updated: 2026-06-06

DataPrep Studio should use a compact, practical desktop interface.

## Scale

- Normal text should stay around 12-14px.
- Section/page headings should stay around 16-20px.
- Buttons should be compact, usually 32-36px tall.
- Icons should be small, usually 16-18px.
- Cards and panels should be slim, with 12-16px padding.
- Small controls should use 8-12px padding.

## Layout

- Prefer dense but readable layouts.
- Avoid oversized cards, buttons, icons, and hero text.
- Avoid large empty whitespace.
- Avoid mobile-like oversized components on desktop.
- Use subtle borders; use shadows only when they add useful separation.
- Prefer table/list/detail layouts for operational workflows.

## Style Direction

The product should feel closer to Jira, Linear, Notion database, or GitHub
Projects: minimal, compact, practical, professional, and information-dense.

## Component Libraries

- When building UI components, it is acceptable to install a lightweight library
  if it materially speeds up implementation or improves polish.
- Prefer small, focused libraries over heavy UI frameworks.
- Icons should use a shared icon library; `react-icons` is currently available.
- Avoid adding large component kits unless there is a clear product reason.
