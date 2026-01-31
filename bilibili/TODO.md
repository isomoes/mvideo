# TODO - Bilibili Video Editor Studio

Based on [ARCH.md](./ARCH.md)

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked
- `||` Can run in parallel with adjacent items

## Phase 1: Foundation & Infrastructure

### 1.1 Project Setup (Sequential - Must complete first)

- [x] Initialize Next.js project with TypeScript
- [x] Configure Remotion integration with Next.js
- [x] Set up project structure (folders for components, services, compositions, plugins)
- [x] Configure ESLint, Prettier, and TypeScript strict mode
- [x] Set up testing framework (Vitest/Jest)

### 1.2 Core Data Models (Can start after 1.1)

- [x] Define TypeScript types for Project, Track, Clip, Asset
- [x] Create Zod schemas for validation
- [x] Set up project state management (Zustand or similar)
- [x] Implement project serialization/deserialization (JSON)

## Phase 2: Media Pipeline (Parallel tracks available)

### 2.1 Ingestion Service || 2.2 FFmpeg Integration

**2.1 Ingestion Service:**

- [x] Create file upload/import endpoint
- [x] Implement metadata extraction (duration, fps, resolution, audio tracks)
- [x] Create Asset record management
- [x] Set up source file storage structure

**2.2 FFmpeg Integration:**

- [x] Set up FFmpeg bindings (fluent-ffmpeg or similar)
- [x] Create FFmpeg command builders for common operations
- [x] Implement error handling and progress reporting
- [x] Add FFmpeg availability check on startup

### 2.3 Media Processing (Requires 2.1 + 2.2)

- [x] Implement video trimming service
- [x] Implement audio normalization (EBU R128 / LUFS target)
- [x] Generate preview proxies (lower resolution for smooth playback)
- [x] Generate thumbnails for timeline
- [x] Generate waveform data for audio visualization

### 2.4 Asset Store (Can start after 2.1)

- [x] Design artifact storage structure (source, trimmed, proxy, waveform)
- [x] Implement asset CRUD operations
- [x] Add derived asset linking (source -> trimmed -> proxy)
- [x] Implement media cache for reusing derived assets

## Phase 3: Remotion Compositions (Can start parallel to Phase 2)

### 3.1 Base Compositions

- [x] Create `IntroComposition` template
- [x] Create `MainComposition` (trimmed OBS with overlay support)
- [x] Create `OutroComposition` template
- [x] Create `FinalComposition` (stitches intro + main + outro)

### 3.2 Composition Props & Configuration

- [x] Define prop types for each composition
- [x] Create composition registry
- [x] Implement props resolver from Project Graph
- [x] Add composition preview configuration

### 3.3 Overlay System

- [x] Create base overlay component
- [x] Implement text overlay
- [x] Implement image overlay
- [x] Add overlay positioning and timing controls

## Phase 4: Studio UI

### 4.1 Core Layout || 4.2 Preview Player

**4.1 Core Layout:**

- [x] Create main studio layout (panels, resizable areas)
- [x] Implement panel system (dockable, collapsible)
- [x] Add keyboard shortcut system
- [x] Create toolbar component

**4.2 Preview Player:**

- [x] Integrate Remotion Player component
- [x] Implement play/pause/seek controls
- [x] Add frame-accurate scrubbing
- [x] Sync player with timeline state

### 4.3 Timeline Component (Requires 4.1 + 4.2)

- [x] Create timeline track container
- [x] Implement clip rendering on timeline
- [x] Add clip trimming (drag handles)
- [x] Implement drag-and-drop clip positioning
- [x] Add snapping behavior
- [x] Display waveform on audio clips
- [x] Add zoom and scroll controls
- [x] Implement playhead with current time indicator

### 4.4 Inspector Panel (Can start after 4.1)

- [x] Create inspector panel layout
- [x] Show clip metadata (duration, source, effects)
- [x] Add effect parameter editors
- [x] Implement trim point adjustment inputs

### 4.5 Export Panel (Can start after 4.1)

- [x] Create export panel UI
- [x] Add render configuration options (resolution, fps, format)
- [x] Display render progress and status
- [x] Show render history and output links

## Phase 5: Render Service

### 5.1 Render Pipeline (Requires Phase 3 + Phase 4.5)

- [ ] Create render job queue
- [ ] Implement project graph to Remotion props resolver
- [ ] Set up Remotion renderer (local mode)
- [ ] Add render progress tracking
- [ ] Store output artifacts

### 5.2 Render Options (Can start after 5.1)

- [ ] Implement render presets (quality profiles)
- [ ] Add batch rendering support

## Phase 6: Plugin System

### 6.1 Plugin Framework (Can start after Phase 4.1)

- [ ] Design plugin API interface
- [ ] Implement plugin loader
- [ ] Create plugin lifecycle hooks:
  - [ ] `onAssetImported(asset)`
  - [ ] `onProjectLoaded(project)`
  - [ ] `onRenderRequested(project, context)`
- [ ] Implement `registerPanel()` for UI extensions
- [ ] Add plugin configuration system

### 6.2 Example Plugin: Audio to SRT (Requires 6.1 + 2.3)

- [ ] Create plugin scaffold
- [ ] Implement audio track extraction
- [ ] Integrate speech-to-text service (external API)
- [ ] Generate SRT file from transcription
- [ ] Attach SRT to project assets
- [ ] Create subtitle track editor panel

## Phase 7: Polish & Production Readiness

### 7.1 Observability || 7.2 Performance

**7.1 Observability:**

- [ ] Add logging for pipeline steps
- [ ] Track render durations
- [ ] Implement error reporting
- [ ] Add usage analytics (optional)

**7.2 Performance:**

- [ ] Optimize timeline rendering (virtualization)
- [ ] Implement lazy loading for large projects
- [ ] Add media cache warming
- [ ] Profile and optimize hot paths

### 7.3 Testing & Documentation

- [ ] Write unit tests for core services
- [ ] Add integration tests for media pipeline
- [ ] Create E2E tests for critical workflows
- [ ] Write user documentation
- [ ] Create plugin development guide

---

## Dependency Graph (Simplified)

```
Phase 1 (Foundation)
    |
    v
+---+---+-------------------+
|       |                   |
v       v                   v
Phase 2 Phase 3             Phase 4.1, 4.2
(Media)  (Compositions)      (UI Core)
|       |                   |
+---+---+                   v
    |                   Phase 4.3, 4.4, 4.5
    v                   (Timeline, Inspector, Export)
Phase 5                     |
(Render)                    |
    |                       |
    +-----------+-----------+
                |
                v
            Phase 6
            (Plugins)
                |
                v
            Phase 7
            (Polish)
```

## Parallel Execution Summary

| Phase                | Can Run In Parallel With |
| -------------------- | ------------------------ |
| 2.1 Ingestion        | 2.2 FFmpeg Integration   |
| 3.x Compositions     | 2.x Media Pipeline       |
| 4.1 Core Layout      | 4.2 Preview Player       |
| 4.4 Inspector        | 4.5 Export Panel         |
| 6.1 Plugin Framework | 5.x Render Service       |
| 7.1 Observability    | 7.2 Performance          |

## Milestones Mapping

| Milestone                                      | Phases            |
| ---------------------------------------------- | ----------------- |
| M1: Ingestion + trimming + audio normalization | 1.1, 1.2, 2.1-2.4 |
| M2: Remotion compositions for intro/main/outro | 3.1-3.3           |
| M3: Studio UI with timeline and preview        | 4.1-4.5           |
| M4: Render service integration                 | 5.1-5.2           |
| M5: Plugin framework with example              | 6.1-6.2           |
