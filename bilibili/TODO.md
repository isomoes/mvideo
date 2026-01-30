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

- [ ] Create file upload/import endpoint
- [ ] Implement metadata extraction (duration, fps, resolution, audio tracks)
- [ ] Create Asset record management
- [ ] Set up source file storage structure

**2.2 FFmpeg Integration:**

- [x] Set up FFmpeg bindings (fluent-ffmpeg or similar)
- [x] Create FFmpeg command builders for common operations
- [x] Implement error handling and progress reporting
- [x] Add FFmpeg availability check on startup

### 2.3 Media Processing (Requires 2.1 + 2.2)

- [ ] Implement video trimming service
- [ ] Implement audio normalization (EBU R128 / LUFS target)
- [ ] Generate preview proxies (lower resolution for smooth playback)
- [ ] Generate thumbnails for timeline
- [ ] Generate waveform data for audio visualization

### 2.4 Asset Store (Can start after 2.1)

- [ ] Design artifact storage structure (source, trimmed, proxy, waveform)
- [ ] Implement asset CRUD operations
- [ ] Add derived asset linking (source -> trimmed -> proxy)
- [ ] Implement media cache for reusing derived assets

## Phase 3: Remotion Compositions (Can start parallel to Phase 2)

### 3.1 Base Compositions

- [x] Create `IntroComposition` template
- [x] Create `MainComposition` (trimmed OBS with overlay support)
- [x] Create `OutroComposition` template
- [x] Create `FinalComposition` (stitches intro + main + outro)

### 3.2 Composition Props & Configuration

- [ ] Define prop types for each composition
- [ ] Create composition registry
- [ ] Implement props resolver from Project Graph
- [ ] Add composition preview configuration

### 3.3 Overlay System

- [ ] Create base overlay component
- [ ] Implement text overlay
- [ ] Implement image overlay
- [ ] Add overlay positioning and timing controls

## Phase 4: Studio UI

### 4.1 Core Layout || 4.2 Preview Player

**4.1 Core Layout:**

- [ ] Create main studio layout (panels, resizable areas)
- [ ] Implement panel system (dockable, collapsible)
- [ ] Add keyboard shortcut system
- [ ] Create toolbar component

**4.2 Preview Player:**

- [ ] Integrate Remotion Player component
- [ ] Implement play/pause/seek controls
- [ ] Add frame-accurate scrubbing
- [ ] Sync player with timeline state

### 4.3 Timeline Component (Requires 4.1 + 4.2)

- [ ] Create timeline track container
- [ ] Implement clip rendering on timeline
- [ ] Add clip trimming (drag handles)
- [ ] Implement drag-and-drop clip positioning
- [ ] Add snapping behavior
- [ ] Display waveform on audio clips
- [ ] Add zoom and scroll controls
- [ ] Implement playhead with current time indicator

### 4.4 Inspector Panel (Can start after 4.1)

- [ ] Create inspector panel layout
- [ ] Show clip metadata (duration, source, effects)
- [ ] Add effect parameter editors
- [ ] Implement trim point adjustment inputs

### 4.5 Export Panel (Can start after 4.1)

- [ ] Create export panel UI
- [ ] Add render configuration options (resolution, fps, format)
- [ ] Display render progress and status
- [ ] Show render history and output links

## Phase 5: Render Service

### 5.1 Render Pipeline (Requires Phase 3 + Phase 4.5)

- [ ] Create render job queue
- [ ] Implement project graph to Remotion props resolver
- [ ] Set up Remotion renderer (local mode)
- [ ] Add render progress tracking
- [ ] Store output artifacts

### 5.2 Render Options (Can start after 5.1)

- [ ] Add Lambda render support (optional)
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
