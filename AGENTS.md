# mvideo Agent Guidelines

## Setup & Commands

- **Deps**: `make setup` (or `uv sync`)
- **Run**: `make run args="--help"` (or `uv run main.py --help`)
- **Clean**: `make clean`
- **Test**: `uv run pytest` (Future: `tests/test_*.py`)

## Code Standards

- **Python**: 3.12+, `ruff` for lint/format.
- **Style**: 4 spaces indent, 88 char line length, double quotes.
- **Imports**: Absolute imports. Group: stdlib, 3rd-party, local.
- **Typing**: Strict typing required. Explicit return types (including `None`). Use `X | None` for optional.
- **Naming**:
  - Vars/Funcs/Files: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_CASE`
- **CLI**: Use `typer`. `typer.Option` for flags, `typer.Argument` for positionals.
- **Logging**: Use `loguru`. Levels: `info` (progress), `success` (done), `warning` (non-fatal), `error` (fatal + exit).

## Error Handling & Subprocesses

- **Fatal**: `logger.error(...)` then `sys.exit(1)`.
- **Exceptions**: Catch specific errors (e.g., `subprocess.CalledProcessError`).
- **Subprocess**:
  - Use `subprocess.run(cmd_list, check=True)`.
  - `capture_output=True` for parsing output.
  - **Never** use `shell=True` or string commands.
