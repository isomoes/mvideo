"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Icon components
const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <path d="M10 8l6 4-6 4V8z" />
  </svg>
);

const AudioIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const TextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 7V4h16v3M9 20h6M12 4v16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

type AssetType = "video" | "audio" | "image" | "text";

type AudioTrackInfo = {
  index: number;
  codec?: string;
  channels?: number;
  sampleRate?: number;
};

type MediaMetadata = {
  durationSeconds: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  audioTracks: AudioTrackInfo[];
};

type DerivedAssetRecord = {
  thumbnailPaths?: string[];
};

type AssetRecord = {
  id: string;
  projectId: string;
  originalName: string;
  sourcePath: string;
  sizeBytes: number;
  createdAt: string;
  metadata: MediaMetadata;
  derived?: DerivedAssetRecord;
};

type ResourceAsset = {
  id: string;
  name: string;
  kind: AssetType;
  durationLabel?: string;
  sizeLabel?: string;
  thumbnailUrl?: string;
  record: AssetRecord;
};

interface AssetCategory {
  id: string;
  name: string;
  type: AssetType;
  assets: ResourceAsset[];
}

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case "video":
      return <VideoIcon />;
    case "audio":
      return <AudioIcon />;
    case "image":
      return <ImageIcon />;
    case "text":
      return <TextIcon />;
    default:
      return <FolderIcon />;
  }
};

const categoryDefinitions: Array<Pick<AssetCategory, "id" | "name" | "type">> = [
  { id: "video", name: "Video", type: "video" },
  { id: "audio", name: "Audio", type: "audio" },
  { id: "image", name: "Images", type: "image" },
  { id: "text", name: "Text & Titles", type: "text" },
];

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v",
]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".aac", ".flac", ".m4a", ".ogg"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"]);

const getAssetKindFromRecord = (record: AssetRecord): AssetType => {
  const extension = record.originalName
    ? `.${record.originalName.split(".").pop()}`.toLowerCase()
    : "";

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  if (AUDIO_EXTENSIONS.has(extension)) {
    return "audio";
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (record.metadata.width && record.metadata.height) {
    return "video";
  }

  if (record.metadata.audioTracks.length > 0) {
    return "audio";
  }

  return "text";
};

const formatDuration = (durationSeconds?: number | null) => {
  if (!durationSeconds || !Number.isFinite(durationSeconds)) {
    return undefined;
  }

  const totalSeconds = Math.round(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) {
    return undefined;
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

const buildThumbnailUrl = (projectId: string, record: AssetRecord, kind: AssetType) => {
  if (record.derived?.thumbnailPaths?.length) {
    return `/api/projects/${projectId}/assets/${record.id}/thumbnails/0`;
  }

  if (kind === "image") {
    return `/api/projects/${projectId}/assets/${record.id}/source`;
  }

  return undefined;
};

interface ResourcesPanelProps {
  projectId: string;
  onAssetSelect?: (asset: ResourceAsset) => void;
  onAssetDragStart?: (asset: ResourceAsset) => void;
}

export const ResourcesPanel = ({ projectId, onAssetSelect, onAssetDragStart }: ResourcesPanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["video", "audio"])
  );
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetRecords, setAssetRecords] = useState<AssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/assets`);
      const payload = await response.json();

      if (!response.ok || payload.type !== "success") {
        throw new Error(payload.message ?? "Failed to load assets.");
      }

      setAssetRecords(payload.data ?? []);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const deleteAsset = useCallback(
    async (assetId: string) => {
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
          method: "DELETE",
        });
        const payload = await response.json();

        if (!response.ok || payload.type !== "success") {
          throw new Error(payload.message ?? "Failed to delete asset.");
        }

        setAssetRecords((prev) => prev.filter((record) => record.id !== assetId));
        setSelectedAsset((prev) => (prev === assetId ? null : prev));
      } catch (error) {
        setErrorMessage((error as Error).message);
      }
    },
    [projectId]
  );

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      setIsImporting(true);
      setErrorMessage(null);

      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`/api/projects/${projectId}/assets/import`, {
            method: "POST",
            body: formData,
          });
          const payload = await response.json();

          if (!response.ok || payload.type !== "success") {
            throw new Error(payload.message ?? "Failed to import asset.");
          }
        }

        await loadAssets();
      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsImporting(false);
        event.target.value = "";
      }
    },
    [loadAssets, projectId]
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleAssetClick = (asset: ResourceAsset) => {
    setSelectedAsset(asset.id);
    onAssetSelect?.(asset);
  };

  const handleDragStart = (e: React.DragEvent, asset: ResourceAsset) => {
    const payload = JSON.stringify({
      source: "resources",
      record: asset.record,
      kind: asset.kind,
    });
    e.dataTransfer.setData("application/vnd.mvideo.asset", payload);
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.effectAllowed = "copy";
    onAssetDragStart?.(asset);
  };

  const resources = useMemo<ResourceAsset[]>(() => {
    return assetRecords.map((record) => {
      const kind = getAssetKindFromRecord(record);
      return {
        id: record.id,
        name: record.originalName,
        kind,
        durationLabel: formatDuration(record.metadata.durationSeconds),
        sizeLabel: formatBytes(record.sizeBytes),
        thumbnailUrl: buildThumbnailUrl(projectId, record, kind),
        record,
      };
    });
  }, [assetRecords, projectId]);

  const categories = useMemo<AssetCategory[]>(() => {
    return categoryDefinitions.map((category) => ({
      ...category,
      assets: resources.filter((asset) => asset.kind === category.type),
    }));
  }, [resources]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return categories;
    }

    return categories.map((category) => ({
      ...category,
      assets: category.assets.filter((asset) => asset.name.toLowerCase().includes(query)),
    }));
  }, [categories, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border">
        <h3 className="text-studio-text font-medium text-sm">Resources</h3>
        <button
          className="p-1 text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Import Media"
          onClick={handleImportClick}
          disabled={isImporting}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-studio-border">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-studio-bg border border-studio-border rounded text-studio-text placeholder:text-studio-text-muted focus:outline-none focus:border-studio-accent"
        />
      </div>

      {/* Asset Categories */}
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        {isLoading && (
          <div className="px-3 py-4 text-xs text-studio-text-muted">Loading assets...</div>
        )}
        {!isLoading && filteredCategories.every((category) => category.assets.length === 0) && (
          <div className="px-3 py-4 text-xs text-studio-text-muted">
            {searchQuery ? "No matching assets." : "No assets imported yet."}
          </div>
        )}
        {filteredCategories.map((category) => (
          <div key={category.id} className="border-b border-studio-border">
            {/* Category Header */}
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-studio-border/50 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <span className="text-studio-text-muted">
                {expandedCategories.has(category.id) ? (
                  <ChevronDownIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </span>
              <span className="text-studio-text-muted">{getAssetIcon(category.type)}</span>
              <span className="text-studio-text text-sm font-medium">{category.name}</span>
              <span className="text-studio-text-muted text-xs ml-auto">
                {category.assets.length}
              </span>
            </button>

            {/* Assets List */}
            {expandedCategories.has(category.id) && (
              <div className="pb-1">
                {category.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`flex items-center gap-2 px-3 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
                      selectedAsset === asset.id
                        ? "bg-studio-accent/20 text-studio-text"
                        : "hover:bg-studio-border/50 text-studio-text-muted"
                    }`}
                    onClick={() => handleAssetClick(asset)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset)}
                  >
                    <span className="shrink-0">
                      {asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.name}
                          className="w-10 h-6 rounded object-cover border border-studio-border"
                          loading="lazy"
                        />
                      ) : (
                        getAssetIcon(asset.kind)
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{asset.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-studio-text-muted">
                        {asset.durationLabel && <span>{asset.durationLabel}</span>}
                        {asset.sizeLabel && <span>{asset.sizeLabel}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 p-1 text-studio-text-muted hover:text-studio-warning hover:bg-studio-border rounded transition-colors"
                      title="Delete asset"
                      onClick={(event) => {
                        event.stopPropagation();
                        void deleteAsset(asset.id);
                      }}
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-studio-border bg-studio-panel-header">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-studio-text-muted hover:text-studio-text bg-studio-bg hover:bg-studio-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <VideoIcon />
            <span>{isImporting ? "Importing..." : "Import"}</span>
          </button>
          <button
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-studio-text-muted hover:text-studio-text bg-studio-bg hover:bg-studio-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <FolderIcon />
            <span>Browse</span>
          </button>
        </div>
        {errorMessage && (
          <p className="mt-2 text-[10px] text-studio-warning">{errorMessage}</p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};
