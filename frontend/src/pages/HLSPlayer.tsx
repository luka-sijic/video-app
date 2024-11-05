import React from 'react';
import ReactPlayer from 'react-player';

const HLSPlayer: React.FC<{ streamUrl: string }> = ({ streamUrl }) => {
  return (
    <ReactPlayer
      url={streamUrl}
      controls
      playing
      width="100%"
      height="100%"
      className="react-player" // Add custom styling if needed
      config={{
        file: {
          attributes: {
            controlsList: 'nodownload' // Add native video attributes if needed
          },
          forceHLS: true, // Ensures HLS.js is used for .m3u8 files
        },
      }}
    />
  );
};

export default HLSPlayer;
