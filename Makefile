.PHONY: setup run clean help

# Default target
.DEFAULT_GOAL := help

setup: ## Install dependencies using uv
	@echo "Installing dependencies..."
	uv sync

run: ## Run the main script (example: make run args="--help")
	@uv run main.py $(args)

clean: ## Clean up temporary files and caches
	@echo "Cleaning up..."
	rm -rf .venv
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
