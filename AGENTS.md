# mvideo Project

## Overview

MVideo is a simple video editor built with C++17, Qt6, and libmpv. It provides basic video playback, timeline editing, and clip management capabilities.

## Project Structure

### Core Files

**src/main.cpp** - Application entry point, initializes Qt application and MainWindow
**include/MainWindow.h** + **src/MainWindow.cpp** - Main application window
**include/Timeline.h** + **src/Timeline.cpp** - Timeline widget for editing
**include/Clip.h** + **src/Clip.cpp** - Clip data model
**CMakeLists.txt** - CMake build configuration
**Makefile** - Convenience wrapper for CMake build commands
