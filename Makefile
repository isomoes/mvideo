.PHONY: setup dev build lint upgrade clean

# Default target
all: setup

# Install dependencies using bun
setup:
	cd bilibili && bun install

# Start the Remotion studio (development)
dev:
	cd bilibili && bun run dev

# Build the Remotion bundle
build:
	cd bilibili && bun run build

# Run linting and type checking
lint:
	cd bilibili && bun run lint

# Upgrade Remotion packages
upgrade:
	cd bilibili && bun run upgrade

# Clean node_modules
clean:
	rm -rf bilibili/node_modules bilibili/bun.lockb bilibili/dist
