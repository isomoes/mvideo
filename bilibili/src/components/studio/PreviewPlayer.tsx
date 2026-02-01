'use client';

import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { useProjectStore } from '../../store/useProjectStore';

import { MainComposition } from '../../remotion/MainComposition';

export const PreviewPlayer: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const { project, clips, assets, playhead, setPlayhead } = useProjectStore();

  // Sync playhead from store to player
  useEffect(() => {
    if (playerRef.current && Math.abs(playerRef.current.getCurrentFrame() - playhead) > 0.1) {
      playerRef.current.seekTo(playhead);
    }
  }, [playhead]);

  const inputProps = {
    clips,
    assets,
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative aspect-video w-full max-w-4xl bg-black shadow-2xl">
        <Player
          ref={playerRef}
          component={MainComposition}
          inputProps={inputProps}
          durationInFrames={project.durationInFrames}
          compositionWidth={project.width}
          compositionHeight={project.height}
          fps={project.fps}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls
          onFrameUpdate={(e) => setPlayhead(e.frame)}
          acknowledgeRemotionLicense
        />
      </div>
      <div className="mt-4 text-sm font-mono text-zinc-500">
        Frame: {Math.floor(playhead)} / {project.durationInFrames}
      </div>
    </div>
  );
};
