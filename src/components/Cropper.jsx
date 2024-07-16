import React, { useState, useEffect, useRef } from 'react';

const Cropper = ({ videoPlayerRef, aspectRatios, onCropperUpdate }) => {
    const [cropperState, setCropperState] = useState({
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
      aspectRatio: aspectRatios[0],
    });
    const [prevState, setPrevState] = useState(cropperState);
    const cropperRef = useRef(null);
  
    useEffect(() => {
      const videoPlayer = videoPlayerRef.current;
      if (videoPlayer) {
        // Set initial cropper size and position based on video player dimensions
        const { width, height } = videoPlayer.getBoundingClientRect();
        setCropperState((prevState) => ({
          ...prevState,
          size: { width: width, height: width * (prevState.aspectRatio.height / prevState.aspectRatio.width) },
          position: { x: 0, y: 0 },
        }));
      }
    }, [videoPlayerRef]);
  
    const handleCropperMove = (e) => {
      const { clientX, clientY } = e;
      const videoPlayer = videoPlayerRef.current;
      const { left, top, width, height } = videoPlayer.getBoundingClientRect();
  
      // Calculate new cropper position based on mouse/touch position
      const newX = clientX - left;
      const newY = clientY - top;
  
      // Constrain cropper position within video player
      const maxX = width - cropperState.size.width;
      const maxY = height - cropperState.size.height;
      const x = Math.max(0, Math.min(maxX, newX));
      const y = Math.max(0, Math.min(maxY, newY));
  
      setCropperState((prevState) => ({
        ...prevState,
        position: { x, y },
      }));
  
      // Notify parent component about cropper update
      onCropperUpdate({ position: { x, y }, size: prevState.size, aspectRatio: prevState.aspectRatio });
    };
  
    const handleCropperResize = (e) => {
      const { clientX, clientY } = e;
      const videoPlayer = videoPlayerRef.current;
      const { left, top, width, height } = videoPlayer.getBoundingClientRect();
  
      // Calculate new cropper size based on mouse/touch position
      const newWidth = clientX - left - cropperState.position.x;
      const newHeight = newWidth * (cropperState.aspectRatio.height / cropperState.aspectRatio.width);
  
      // Constrain cropper size within video player
      const maxWidth = width - cropperState.position.x;
      const maxHeight = height - cropperState.position.y;
      const newSize = {
        width: Math.max(100, Math.min(maxWidth, newWidth)),
        height: Math.max(100, Math.min(maxHeight, newHeight)),
      };
  
      setPrevState(cropperState);
      setCropperState((prevState) => ({
        ...prevState,
        size: newSize,
      }));
  
      // Notify parent component about cropper update
      onCropperUpdate({ position: prevState.position, size: newSize, aspectRatio: prevState.aspectRatio });
    };
  
    const handleAspectRatioChange = (newAspectRatio) => {
      const videoPlayer = videoPlayerRef.current;
      const { width, height } = videoPlayer.getBoundingClientRect();
  
      // Calculate new cropper size based on the new aspect ratio
      const newHeight = width * (newAspectRatio.height / newAspectRatio.width);
  
      setCropperState((prevState) => ({
        ...prevState,
        aspectRatio: newAspectRatio,
        size: { width: width, height: newHeight },
      }));
  
      // Notify parent component about cropper update
      onCropperUpdate({ position: prevState.position, size: { width: width, height: newHeight }, aspectRatio: newAspectRatio });
    };
  
    return (
      <div
        ref={cropperRef}
        className="cropper"
        style={{
          position: 'absolute',
          left: `${cropperState.position.x}px`,
          top: `${cropperState.position.y}px`,
          width: `${cropperState.size.width}px`,
          height: `${cropperState.size.height}px`,
          border: '2px solid white',
          cursor: 'move',
        }}
        onMouseDown={handleCropperMove}
        onTouchStart={handleCropperMove}
        onMouseMove={handleCropperResize}
        onTouchMove={handleCropperResize}
      >
        {/* Cropper UI elements (handles, aspect ratio selector, etc.) */}
      </div>
    );
  };
  
  export default Cropper;