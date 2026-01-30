# Architecture - Bilibili Video Editor Studio

## Purpose
This document defines the architecture for a Remotion-based video editor studio focused on:

- Adding start/end composited segments using Remotion compositions
- Trimming OBS recorded source videos
- Normalizing audio volume
- Providing a studio UI with preview, timeline, and editing controls
- Extending features via a plugin system (example: audio to SRT)

## Goals
- Provide a production-ready editing workflow around OBS recordings
- Render outputs using Remotion compositions and assets
- Support interactive preview and timeline editing
- Enable feature extension without core rewrites

## Non-Goals
- Replace a full NLE (non-linear editor) feature set
- Provide realtime collaborative editing in the first iteration

## System Overview
The system is a Next.js app with Remotion for preview and rendering. A processing pipeline prepares media assets (trim, normalize, derive metadata). A plugin system adds optional transformations (e.g. transcription to SRT).

```
OBS Recordings
    |
    v
Ingestion + Metadata Extract
    |
    v
Media Pipeline (trim, normalize, generate proxies)
    |
    v
Asset Store + Project Graph
    |
    +--> Remotion Studio UI (timeline + preview)
    |
    +--> Render Service (Remotion render)
```

## Core Components

### 1. Ingestion Service
- Accepts OBS video files and optional sidecar metadata
- Extracts technical metadata (duration, fps, resolution, audio tracks)
- Creates a media asset record and stores original source

### 2. Media Pipeline
Responsibilities:
- Trim the OBS source to produce the active working range
- Normalize audio volume to a target loudness (EBU R128 / LUFS)
- Generate preview proxies for smooth studio playback
- Create thumbnails and waveform data for timeline UI

Implementation notes:
- Use FFmpeg for trimming and audio normalization
- Store derived artifacts alongside the source asset

### 3. Project Graph
Defines the editable structure of a video:
- Timeline tracks (video, audio, overlays)
- References to trimmed source and derived assets
- Start/End composited segments as Remotion compositions
- Render settings (resolution, fps, output format)

### 4. Remotion Compositions
Key compositions:
- `IntroComposition`: optional start segment
- `MainComposition`: trimmed OBS recording with overlays
- `OutroComposition`: optional end segment
- `FinalComposition`: stitches intro + main + outro

Remotion is used for both preview (Remotion Player) and final rendering.

### 5. Studio UI
Key capabilities:
- Timeline with clip trimming, drag-and-drop, and snapping
- Preview player synced with timeline
- Inspector for clip metadata and effects
- Export panel for render configuration and status

### 6. Render Service
Responsibilities:
- Render using Remotion renderer (local or Lambda)
- Resolve project graph into Remotion props
- Track job status and store output artifacts

## Data Model (Conceptual)

```
Project
  id
  title
  settings { width, height, fps, format }
  timeline [Track]
  introComposition?
  outroComposition?

Track
  id
  type (video | audio | overlay)
  clips [Clip]

Clip
  id
  assetId
  inFrame
  outFrame
  positionFrame
  effects [Effect]

Asset
  id
  sourcePath
  trimmedPath?
  proxyPath?
  waveformPath?
```

## Plugin System
Plugins add non-core features without changing core flow.

### Plugin API (Conceptual)
- `onAssetImported(asset)`
- `onProjectLoaded(project)`
- `onRenderRequested(project, context)`
- `registerPanel()` for studio UI panels

### Example: Audio to SRT
- Plugin reads the trimmed audio track
- Runs speech-to-text (external service)
- Writes `.srt` file and attaches to project
- Exposes a subtitle track editor panel

## Processing Flow
1. User imports OBS recording
2. Ingestion extracts metadata and stores source
3. Pipeline trims and normalizes audio; creates proxies and waveform
4. Studio loads project graph and renders preview
5. User edits timeline, adds intro/outro compositions
6. Render service produces final output

## Storage and Artifacts
- Source media: original OBS recording
- Derived media: trimmed source, normalized audio, proxies
- Project data: JSON in database or file store
- Render output: final mp4 and optional SRT

## Operational Concerns
- Deterministic rendering: use fixed composition versions and inputs
- Media cache: reuse derived assets to avoid reprocessing
- Observability: log pipeline steps and render durations

## Milestones
1. Ingestion + trimming + audio normalization pipeline
2. Remotion compositions for intro/main/outro
3. Studio UI with timeline and preview
4. Render service integration
5. Plugin framework with an example (audio to SRT)
