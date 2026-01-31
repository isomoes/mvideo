# Studio UI Architecture

## 1. Overview

The Studio UI is the frontend interface for the video editor, designed to provide a professional Non-Linear Editing (NLE) experience. It is built using **Next.js**, **React**, and **Remotion**, focusing on performance, modularity, and a clean user experience.

The goal is to provide a seamless workflow for:
1.  **Importing** media assets (video, audio, images).
2.  **Editing** clips on a multi-track timeline.
3.  **Previewing** changes in real-time.
4.  **Configuring** properties via an inspector.
5.  **Exporting** the final video composition.

## 2. Architecture

The architecture follows a **unidirectional data flow** pattern, heavily relying on **Zustand** for state management and **Remotion** for video rendering.

### High-Level Component Hierarchy

```mermaid
graph TD
    Page[Page (Next.js)] --> StudioLayout
    StudioLayout --> Toolbar[StudioToolbar]
    StudioLayout --> LeftPanel[ResourcesPanel]
    StudioLayout --> CenterPanel[PreviewPlayer]
    StudioLayout --> RightPanel[InspectorPanel]
    StudioLayout --> BottomPanel[TimelinePanel]
    
    CenterPanel --> RemotionPlayer[Remotion Player]
    RemotionPlayer --> Compositions[Remotion Compositions]
    
    Store[Zustand Stores] --> Page
    Store --> StudioLayout
    Store --> Components
```

### Core Technologies

-   **Framework**: Next.js 14+ (App Router)
-   **UI Library**: React 18+
-   **Styling**: Tailwind CSS
-   **Video Engine**: Remotion
-   **State Management**: Zustand
-   **Layout**: react-resizable-panels
-   **Icons**: Lucide React

## 3. Core Components

### 3.1 Studio Layout (`StudioLayout.tsx`)
-   **Responsibility**: Manages the overall grid layout of the application.
-   **Implementation**: Uses `react-resizable-panels` to create a flexible, user-customizable workspace.
-   **Regions**:
    -   **Top**: Toolbar
    -   **Left**: Resources / Assets
    -   **Center**: Video Preview
    -   **Right**: Property Inspector
    -   **Bottom**: Timeline

### 3.2 Preview Player (`PreviewPlayer.tsx`)
-   **Responsibility**: Renders the video project in real-time.
-   **Features**:
    -   Integrated `@remotion/player`.
    -   Playback controls (Play/Pause, Seek, Frame Step).
    -   Timecode display.
    -   In/Out point markers.
-   **Data Source**: Subscribes to the `ProjectStore` to get the current composition state.

### 3.3 Timeline Panel (`TimelinePanel.tsx`)
-   **Responsibility**: Visual representation of the project's temporal structure.
-   **Features**:
    -   Multi-track support (Video, Audio, Overlay, Subtitle).
    -   Clip manipulation (Drag, Resize/Trim).
    -   Playhead synchronization.
    -   Zoom and Scroll.
-   **Interaction**: Updates `ProjectStore` on clip changes; syncs playhead with `PreviewPlayer`.

### 3.4 Inspector Panel (`InspectorPanel.tsx`)
-   **Responsibility**: Context-aware property editor.
-   **Features**:
    -   Displays properties for the currently selected object (Clip, Track, or Project).
    -   Edits transform (Position, Scale), timing, audio, and effects.
-   **Interaction**: Dispatches updates to `ProjectStore`.

### 3.5 Resources Panel (`ResourcesPanel.tsx`)
-   **Responsibility**: Asset management browser.
-   **Features**:
    -   Lists imported media (Video, Audio, Images).
    -   Drag-and-drop to Timeline.
    -   File import interface.
-   **Data Source**: `AssetStore` / `ProjectStore`.

### 3.6 Studio Toolbar (`StudioToolbar.tsx`)
-   **Responsibility**: Global tools and actions.
-   **Features**:
    -   Tool selection (Select, Razor, Hand).
    -   Undo/Redo.
    -   Export trigger.
    -   Project settings.

## 4. State Management

We use **Zustand** to manage the application state, split into logical stores:

### 4.1 `useProjectStore`
The single source of truth for the video project.
-   **State**:
    -   `project`: Metadata (resolution, fps, duration).
    -   `tracks`: Array of tracks.
    -   `clips`: Array of clips with properties.
    -   `assets`: Map of available assets.
-   **Actions**: `addClip`, `updateClip`, `removeClip`, `moveClip`, `setProjectSettings`.

### 4.2 `useUIStore`
Manages transient UI state.
-   **State**:
    -   `selection`: IDs of selected clips/tracks.
    -   `playhead`: Current time in frames.
    -   `zoomLevel`: Timeline zoom factor.
    -   `activeTool`: Current tool (Select, Razor, etc.).
    -   `panels`: Collapse/expand state of UI panels.

## 5. Data Flow

1.  **User Action**: User drags a clip on the Timeline.
2.  **Event Handling**: `TimelinePanel` captures the drag event.
3.  **State Update**: `useProjectStore.getState().updateClip(...)` is called.
4.  **Re-render**:
    -   `TimelinePanel` re-renders to show new clip position.
    -   `PreviewPlayer` (via Remotion) receives new props and re-renders the frame.
    -   `InspectorPanel` updates if the moved clip is selected.

## 6. Integration Plan (Replanning)

The current implementation has the UI components in place. The next phase focuses on wiring them to the real logic.

### Phase 1: State Connection
-   [ ] Replace mock data in `TimelinePanel` with `useProjectStore` selectors.
-   [ ] Connect `InspectorPanel` inputs to `useProjectStore` actions.
-   [ ] Bind `ResourcesPanel` to the actual Asset inventory.

### Phase 2: Remotion Integration
-   [ ] Ensure `resolve-composition-props.ts` correctly maps the Project Graph to Remotion props.
-   [ ] Verify frame-accurate synchronization between Timeline playhead and Remotion Player.

### Phase 3: Media Pipeline
-   [ ] Connect `ingestion.ts` to the UI for real file uploads.
-   [ ] Implement the "Export" workflow using the Render Service.

## 7. Future Roadmap

-   **Plugin System**: Allow third-party extensions for effects and transitions.
-   **Virtualization**: Optimize Timeline for projects with 1000+ clips.
-   **Collaboration**: Real-time multi-user editing (using CRDTs or similar).
-   **AI Features**: Auto-cut silence, auto-captioning integration.
