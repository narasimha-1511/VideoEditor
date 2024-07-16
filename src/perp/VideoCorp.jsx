import React, { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import styled from "styled-components";

const VideoCrop = () => {
  const [video, setVideo] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    const videoElement = document.getElementById("video");
    videoElement.src = "./videoChatApp.mp4";

    const handleVideoClick = () => {
      videoElement.play();
    };

    videoElement.addEventListener("click", handleVideoClick);
    setVideo(videoElement);

    return () => {
      videoElement.removeEventListener("click", handleVideoClick);
    };
  }, []);

  const handleCropChange = (croppedArea, croppedPixels) => {
    setCrop(croppedArea);
    setCroppedAreaPixels(croppedPixels);
    updatePreview(croppedPixels);
  };

  const handleZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const updatePreview = (croppedAreaPixels) => {
    const canvas = previewCanvasRef.current;
    const video = document.getElementById("video");

    if (!croppedAreaPixels || !canvas || !video) {
      return;
    }

    const { width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const updatePreviewFrame = () => {
      ctx.drawImage(
        video,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        width,
        height
      );
      requestAnimationFrame(updatePreviewFrame);
    };

    updatePreviewFrame();
  };

  return (
    <Container>
      <VideoContainer>
        <video id="video" width="640" height="480" controls>
          Your browser does not support the video tag.
        </video>
        <Cropper
          image={video}
          crop={crop}
          zoom={zoom}
          onCropChange={handleCropChange}
          onZoomChange={handleZoomChange}
        />
      </VideoContainer>
      <PreviewContainer>
        <PreviewCanvas ref={previewCanvasRef} />
      </PreviewContainer>
    </Container>
  );
};

export default VideoCrop;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const VideoContainer = styled.div`
  position: relative;
`;

const PreviewContainer = styled.div`
  width: 300px;
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const PreviewCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;
