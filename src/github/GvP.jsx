import React, { useRef, useState, useEffect } from 'react';
import './VideoCropper.css';

const aspectRatios = {
  '9:18': 9 / 18,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '1:1': 1 / 1,
  '4:5': 4 / 5,
};

const VideoCropper = () => {
  const videoRef = useRef(null);
  const croppedVideoRef = useRef(null); // Ref for cropped preview video
  const [isDragging, setIsDragging] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialCropperLeft, setInitialCropperLeft] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [cropperWidth, setCropperWidth] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedRegion, setCroppedRegion] = useState(null); // State to store cropped region data
  const [cropperLeft, setCropperLeft] = useState(0); // Adjust default cropperLeft to 0

  // const HandleCropperLeft = () => {
  //   setCropperLeft(videoRef.current.getBoundingClientRect().left - 1);
  // }

  useEffect(() => {
    const video = videoRef.current;

    const updateCropperWidth = () => {
      if (video) {
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const selectedAspectRatio = aspectRatios[aspectRatio];

        if (videoAspectRatio > selectedAspectRatio) {
          setCropperWidth(video.offsetHeight * selectedAspectRatio);
        } else {
          setCropperWidth(video.offsetWidth);
        }
      }
    };

    updateCropperWidth();

    const handleResize = () => {
      updateCropperWidth();
      // Adjust cropperLeft if necessary on resize
      if (cropperLeft + cropperWidth > video.getBoundingClientRect().right) {
        setCropperLeft(video.getBoundingClientRect().right - cropperWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [aspectRatio, cropperLeft, cropperWidth]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !croppedVideoRef.current) return;

    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const selectedAspectRatio = aspectRatios[aspectRatio];
    const cropperHeight = cropperWidth / selectedAspectRatio;

    const videoLeft = video.getBoundingClientRect().left;
    const cropperRelativeLeft = cropperLeft - videoLeft;
    const cropperRelativeTop = (video.offsetHeight - cropperHeight) / 2; // Adjust this based on your layout

    const croppedRegionData = {
      left: cropperRelativeLeft,
      top: cropperRelativeTop,
      width: cropperWidth,
      height: cropperHeight,
    };

    // setCroppedRegion(croppedRegionData);

    // Adjust cropped video playback
    const scaleX = video.videoWidth / video.offsetWidth;
    const scaleY = video.videoHeight / video.offsetHeight;

    croppedVideoRef.current.currentTime = video.currentTime;
    croppedVideoRef.current.style.objectPosition = `-${
      cropperRelativeLeft * scaleX
    }px -${cropperRelativeTop * scaleY}px`;
    croppedVideoRef.current.style.objectFit = "none";
    croppedVideoRef.current.style.width = `${video.offsetWidth * scaleX}px`;
    croppedVideoRef.current.style.height = `${video.offsetHeight * scaleY}px`;
  }, [cropperLeft, cropperWidth, aspectRatio]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setInitialMouseX(e.clientX);
    setInitialCropperLeft(cropperLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Update cropped region on mouse up
    updateCroppedRegion();
  };

  const updateCroppedRegion = () => {
    const video = videoRef.current;

    if (!video) return;

    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const selectedAspectRatio = aspectRatios[aspectRatio];
    const cropperHeight = cropperWidth / selectedAspectRatio;

    const videoLeft = video.getBoundingClientRect().left;
    const cropperRelativeLeft = cropperLeft - videoLeft;
    const cropperRelativeTop = (video.offsetHeight - cropperHeight) / 2; // Adjust this based on your layout

    const croppedRegionData = {
      left: cropperRelativeLeft,
      top: cropperRelativeTop,
      width: cropperWidth,
      height: cropperHeight,
    };

    setCroppedRegion(croppedRegionData);

    // Adjust cropped video playback
    const scaleX = video.videoWidth / video.offsetWidth;
    const scaleY = video.videoHeight / video.offsetHeight;

    croppedVideoRef.current.currentTime = video.currentTime;
    croppedVideoRef.current.style.objectPosition = `-${
      cropperRelativeLeft * scaleX
    }px -${cropperRelativeTop * scaleY}px`;
    croppedVideoRef.current.style.objectFit = "none";
    croppedVideoRef.current.style.width = `${video.offsetWidth * scaleX}px`;
    croppedVideoRef.current.style.height = `${video.offsetHeight * scaleY}px`;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - initialMouseX;
    const videoContainer = videoRef.current.getBoundingClientRect();
    const newLeft = initialCropperLeft + deltaX;

    // Ensure cropper stays within video bounds
    setCropperLeft(
      Math.max(
        videoContainer.left,
        Math.min(newLeft, videoContainer.right - cropperWidth)
      )
    );
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      <div className="controls">
        <label htmlFor="aspect-ratio">Aspect Ratio: </label>
        <select
          id="aspect-ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        >
          {Object.keys(aspectRatios).map((ratio) => (
            <option key={ratio} value={ratio}>
              {ratio}
            </option>
          ))}
        </select>
        <label htmlFor="show-cropper">Show Cropper: </label>
        <input
          id="show-cropper"
          type="checkbox"
          checked={showCropper}
          onChange={(e) => {
            setAspectRatio("9:16");
            setShowCropper(e.target.checked);
          }}
        />
      </div>
      <div className="video-container">
        <video width="640" height="360" ref={videoRef} controls>
          <source src="./videoChatApp.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {showCropper && (
          <div
            id="cropper"
            className="cropper"
            style={{
              height: videoRef.current
                ? `${videoRef.current.clientHeight - 25}px`
                : "335px",
              width: `${cropperWidth}px`,
              left: cropperLeft == 0 ? undefined : `${cropperLeft}px`,
              zIndex: 1, // Ensure cropper stays above video
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="vertical-line left"></div>
            <div className="vertical-line right"></div>
            <div className="dashed-line dashed-line-1"></div>
            <div className="dashed-line dashed-line-2"></div>
            <div className="horizontal-group">
              <div className="horizontal-dashed-line"></div>
              <div className="horizontal-dashed-line"></div>
            </div>
          </div>
        )}

        {croppedRegion && (
          <div className="cropped-preview">
            <p>Cropped Preview:</p>
            <video
              width="640"
              height="360"
              ref={croppedVideoRef}
              controls
              style={{
                position: "relative",
                left: `${croppedRegion.left / 10}px`,
                top: `${croppedRegion.top / 10}px`,
                width: `${croppedRegion.width / 10}px`,
                height: `${croppedRegion.height / 10}px`,
                border: "1px dashed red", // Example border for visualization
              }}
            >
              <source src="./videoChatApp.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoCropper;
