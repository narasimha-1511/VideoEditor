import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, onProgress, playbackRate, volume, children }) => {
  return (
    <div className="video-player-container">
      <ReactPlayer
        url={url}
        controls
        playbackRate={playbackRate}
        volume={volume}
        onProgress={onProgress}
        width="100%"
        height="100%"
      />
      {children}
    </div>
  );
};

export default VideoPlayer;
