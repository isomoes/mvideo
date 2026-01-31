"use client";

import React, { useState } from "react";

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

type AssetType = "video" | "audio" | "image" | "text";

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  duration?: string;
  size?: string;
  thumbnail?: string;
}

interface AssetCategory {
  id: string;
  name: string;
  type: AssetType;
  assets: Asset[];
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

// Demo data
const demoCategories: AssetCategory[] = [
  {
    id: "video",
    name: "Video",
    type: "video",
    assets: [
      { id: "v1", name: "OBS_2026-01-25.mp4", type: "video", duration: "17:02", size: "1.2 GB" },
      { id: "v2", name: "Intro_Template.mp4", type: "video", duration: "00:12", size: "45 MB" },
      { id: "v3", name: "Outro_Template.mp4", type: "video", duration: "00:08", size: "32 MB" },
    ],
  },
  {
    id: "audio",
    name: "Audio",
    type: "audio",
    assets: [
      { id: "a1", name: "Background_Music.mp3", type: "audio", duration: "03:45", size: "8.2 MB" },
      { id: "a2", name: "Normalized_Audio.wav", type: "audio", duration: "17:02", size: "180 MB" },
    ],
  },
  {
    id: "image",
    name: "Images",
    type: "image",
    assets: [
      { id: "i1", name: "Logo.png", type: "image", size: "256 KB" },
      { id: "i2", name: "Subscribe_Button.png", type: "image", size: "128 KB" },
      { id: "i3", name: "Thumbnail.jpg", type: "image", size: "512 KB" },
    ],
  },
  {
    id: "text",
    name: "Text & Titles",
    type: "text",
    assets: [
      { id: "t1", name: "Title Card", type: "text" },
      { id: "t2", name: "Lower Third", type: "text" },
      { id: "t3", name: "Auto SRT Subtitles", type: "text" },
    ],
  },
];

interface ResourcesPanelProps {
  onAssetSelect?: (asset: Asset) => void;
  onAssetDragStart?: (asset: Asset) => void;
}

export const ResourcesPanel = ({ onAssetSelect, onAssetDragStart }: ResourcesPanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["video", "audio"])
  );
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset.id);
    onAssetSelect?.(asset);
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData("application/json", JSON.stringify(asset));
    e.dataTransfer.effectAllowed = "copy";
    onAssetDragStart?.(asset);
  };

  const filteredCategories = demoCategories.map((category) => ({
    ...category,
    assets: category.assets.filter((asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-studio-panel-header border-b border-studio-border">
        <h3 className="text-studio-text font-medium text-sm">Resources</h3>
        <button
          className="p-1 text-studio-text-muted hover:text-studio-text hover:bg-studio-border rounded transition-colors"
          title="Import Media"
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
                    <span className="shrink-0">{getAssetIcon(asset.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{asset.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-studio-text-muted">
                        {asset.duration && <span>{asset.duration}</span>}
                        {asset.size && <span>{asset.size}</span>}
                      </div>
                    </div>
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
          <button className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-studio-text-muted hover:text-studio-text bg-studio-bg hover:bg-studio-border rounded transition-colors">
            <VideoIcon />
            <span>Import</span>
          </button>
          <button className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-studio-text-muted hover:text-studio-text bg-studio-bg hover:bg-studio-border rounded transition-colors">
            <FolderIcon />
            <span>Browse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
