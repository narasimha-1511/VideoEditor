"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Draggable from "react-draggable";
import { DndContext, useDraggable } from "@dnd-kit/core";

import VolumeImage from "@/public/volume.svg";
import PlayImage from "@/public/play.svg";
import ReactPlayer from "react-player";
import PreviewImage from "@/public/preview.svg";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export default function Home() {
  const [tab, setTab] = useState("preview");

  const [cropper, setCropper] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);

  const containerRef = useRef(null);

  const tabs = [
    {
      value: "preview",
      label: "Preview Session",
    },
    {
      value: "generate",
      label: "Generate Session",
    },
  ];

  const [playerState, setPlayerState] = useState({
    url: "./video4.mp4",
    playing: false,
    pip: false,
    controls: false,
    muted: false,
    volume: 0,
    played: 0,
    light: false,
    loaded: 0,
    playbackRate: 1.0,
    duration: 0,
    loop: false,
  });
  const [cropSize, setCropSize] = useState({ width: 200, height: 100 }); // Default crop size

  const playerRef = useRef(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    width: cropSize.width,
  });

  const handlePlay = () => {
    console.log("onPlay", playerState.played);
    setPlayerState({ ...playerState, playing: true });
  };

  const handleDuration = (duration) => {
    console.log("onDuration", duration);

    setPlayerState({ ...playerState, duration });
  };

  const handleProgess = (state) => {
    if (!playerState.seeking) {
      setPlayerState({ ...playerState, played: state.played });
    }
  };

  const handlePause = () => {
    console.log("onPause");

    setPlayerState({ ...playerState, playing: false });
  };

  const handleSeekMouseDown = (e) => {
    setPlayerState({ ...playerState, seeking: true });
    playerRef.current.seekTo(parseFloat(e.target.value));
    secondPlayer.current.seekTo(parseFloat(e.target.value));
  };

  const handleSeekChange = (e) => {
    recordAction("seek");
    setPlayerState({ ...playerState, played: parseFloat(e.target.value) });
    playerRef.current.seekTo(parseFloat(e.target.value));
    secondPlayer.current.seekTo(parseFloat(e.target.value));

    recordAction("seek");
  };

  const handleSeekMouseUp = (e) => {
    playerRef.current.seekTo(parseFloat(e.target.value));
    secondPlayer.current.seekTo(parseFloat(e.target.value));

    setPlayerState({ ...playerState, seeking: false });
  };

  const [cornerPositions, setCornerPositions] = useState({
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
  });

  function filterAndCondense(data) {
    const result = [];
    let current = null;

    for (const item of data) {
      // If current is null or a new time or endTime group has started
      if (
        !current ||
        item.time !== current.time ||
        item.endTime !== current.endTime
      ) {
        if (current) {
          result.push(current);
        }
        current = { ...item, xRange: [item.x, item.x] };
      } else {
        // Update the xRange to cover the new x value
        current.xRange[1] = item.x;
      }
    }

    // Add the last accumulated item
    if (current) {
      result.push(current);
    }

    // Optionally, transform xRange to a single x value if needed
    return result.map((item) => {
      const { xRange, ...rest } = item;
      return { ...rest, xStart: xRange[0], xEnd: xRange[1] };
    });
  }

  const handleDrag = (e, data) => {
    const container = containerRef.current; // Replace with your container's ID
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth - container.clientWidth;

    const scrollPercentageVertical = (scrollTop / scrollHeight) * 100;
    const scrollPercentageHorizontal = (scrollLeft / scrollWidth) * 100;

    const draggableElement = e.target;
    // const { offsetWidth: width, offsetHeight: height } = draggableElement;
    const width = cropSize.width;
    const height = cropSize.height;

    // Calculate the corner positions
    const newCornerPositions = {
      topLeft: { x: data.x, y: data.y },
      topRight: { x: data.x + width, y: data.y },
      bottomLeft: { x: data.x, y: data.y + height },
      bottomRight: { x: data.x + width, y: data.y + height },
    };

    // Update position state with scroll percentages included
    const newPosition = {
      x: data.x,
      y: data.y,
      width: cropSize.width,
    };

    setPosition(newPosition);
    setCornerPositions(newCornerPositions);
  };

  const [actionList, setActionList] = useState([]);

  const recordAction = (action) => {
    console.log("Action Recorded", action);

    const currentAction = {
      timeStamps: playerState.played * playerState.duration,
      coordinates: position,
      volume: playerState.volume,
      playBackRate: playerState.playbackRate,
      action,
    };

    switch (action) {
      case "play":
        setActionList([...actionList, currentAction]);

        if (cropper) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }

        break;
      case "pause":
        setActionList([...actionList, currentAction]);

        if (cropper) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }
        break;
      case "volume":
        setActionList([...actionList, currentAction]);

        if (cropper) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }
        break;
      case "speed":
        setActionList([...actionList, currentAction]);

        if (cropper) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }
        break;
      case "seek":
        setActionList([...actionList, currentAction]);

        if (cropper) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }
        break;
      case "aspectRatio":
        setActionList([...actionList, currentAction]);
        break;
      case "positionStart":
      case "positionEnd":
        setActionList([...actionList, currentAction]);

        if (cropper && playerState.playing) {
          setActionList([...actionList, currentAction]);
        } else {
          console.log("Not Recording this Action as Cropper is not enabled.");
        }

        break;
      default:
        break;
    }
  };

  function parseVideoEditingData(data, videoWidth, videoHeight) {
    let result = [];
    let currentClip = null;
    let positionStartTime = null;
    let positionStartX = null;

    data.forEach((entry, index) => {
      switch (entry.action) {
        case "play":
          if (!currentClip) {
            // Start a new clip if there's no current clip
            currentClip = {
              startTime: entry.timeStamps,
              endTime: null,
              coordinates: entry.coordinates,
              volume: entry.volume,
              playBackRate: entry.playBackRate,
              scrollingEffect: false,
              positionStartX: null,
              positionEndX: null,
            };
          }
          break;
        case "pause":
          if (currentClip) {
            if (positionStartTime !== null) {
              // Close the clip at positionStart time
              currentClip.endTime = positionStartTime;
              result.push(currentClip);
              // Create a new clip from positionStart to pause
              currentClip = {
                startTime: positionStartTime,
                endTime: entry.timeStamps,
                coordinates: entry.coordinates,
                volume: entry.volume,
                playBackRate: entry.playBackRate,
                scrollingEffect: false,
                positionStartX: positionStartX,
                positionEndX: null,
              };
            } else {
              // Close the current clip
              currentClip.endTime = entry.timeStamps;
              result.push(currentClip);
              currentClip = null;
            }
            positionStartTime = null;
            positionStartX = null;
          }
          break;
        case "positionStart":
          if (currentClip) {
            // Split the clip at positionStart
            if (currentClip.startTime !== null) {
              currentClip.endTime = entry.timeStamps;
              result.push(currentClip);
            }
            positionStartTime = entry.timeStamps;
            positionStartX = entry.coordinates.x;
            currentClip = {
              startTime: entry.timeStamps,
              endTime: null,
              coordinates: entry.coordinates,
              volume: entry.volume,
              playBackRate: entry.playBackRate,
              scrollingEffect: false,
              positionStartX: positionStartX,
              positionEndX: null,
            };
          }
          break;
        case "positionEnd":
          if (currentClip && positionStartTime !== null) {
            // Close the current clip at positionEnd time and mark scrollingEffect as true
            currentClip.endTime = entry.timeStamps;
            currentClip.scrollingEffect = true;
            currentClip.positionEndX = entry.coordinates.x;
            result.push(currentClip);
            currentClip = null;
            positionStartTime = null;
            positionStartX = null;
          }
          break;
        default:
          break;
      }
    });

    // Handle the case where the last clip might not be closed
    if (
      currentClip &&
      currentClip.startTime !== null &&
      currentClip.endTime === null
    ) {
      currentClip.endTime = data[data.length - 1].timeStamps;
      result.push(currentClip);
    }

    return result;
  }

  const cropVideo = async () => {
    if (typeof window !== "undefined") {
      const ffmpeg = createFFmpeg({ log: true });

      await ffmpeg.load();
      const inputFile = playerState.url;
      const cropX = position.x;
      const cropWidth = cropSize.width;

      // Get the video element and its dimensions
      const videoElement = playerRef.current.getInternalPlayer();
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      // Load the input video
      ffmpeg.FS("writeFile", "input.mp4", await fetchFile(inputFile));

      const frameRate = 30; // Default to 30 if not found

      console.log("Frame Rate:", frameRate);

      // Generate crop data
      const positionData = parseVideoEditingData(actionList);

      console.log(
        "Crop Video",
        inputFile,
        adjustedCropX,
        adjustedCropWidth,
        videoHeight
      );

      ffmpeg.FS("writeFile", "input.mp4", await fetchFile(inputFile));

      await ffmpeg.run(
        "-i",
        "input.mp4",
        "-vf",
        `crop=${adjustedCropWidth}:${videoHeight}:${adjustedCropX}:0`,
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      setOutputUrl(url);
      setTab("generate");
    }
  };

  return (
    <>
      <main className="flex max-h-screen min-h-screen min-w-screen bg-black  justify-center gap-8 items-center">
        <div className="bg-[#37393F] h-[668px] max-w-[1082px]  w-full rounded-lg gap-4 flex flex-col">
          <div className="flex justify-between items-center px-4 pt-4">
            <span className="font-bold text-white">Cropper</span>

            <div className="flex bg-[#45474E] rounded-md p-1 ">
              {tabs.map((item, index) => (
                <>
                  <div
                    key={index}
                    onClick={() => setTab(item.value)}
                    className={`${
                      tab == item.value ? "bg-[#37393F]" : ""
                    } flex cursor-pointer justify-center rounded-md items-center p-2 px-3`}
                  >
                    <span>{item.label}</span>
                  </div>
                </>
              ))}
            </div>
            {tab == "preview" && (
              <div className="grid grid-cols-2 w-full px-4 h-full">
                <div className="w-full flex flex-col gap-4">
                  <div className="relative">
                    <Draggable
                      axis="x"
                      bounds="parent"
                      onDrag={handleDrag}
                      onStop={() => {
                        recordAction("position");
                      }}
                    >
                      <div
                        ref={containerRef}
                        style={{
                          width: cropSize.width,
                          visibility: cropper ? "visible" : "hidden",
                        }}
                        className={`absolute z-10 crop-div min-h-full grid grid-cols-3 grid-rows-3 border-[1px] border-white`}
                      >
                        {Array.from({ length: 9 }).map((_, index) => (
                          <div
                            key={index}
                            className="border-[0.5px] opacity-40 border-dashed border-white flex justify-center items-center"
                          >
                            {/* {index} */}
                          </div>
                        ))}
                      </div>
                    </Draggable>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center w-full ">
                      <Image
                        className="cursor-pointer"
                        onClick={() => {
                          recordAction(playerState.playing ? "pause" : "play");
                          setPlayerState({
                            ...playerState,
                            playing: !playerState.playing,
                          });
                        }}
                        src={PlayImage}
                        alt="Pause Play Control"
                      />
                      <div className="w-full">
                        <input
                          type="range"
                          className="w-full"
                          min={0}
                          max={0.999999}
                          step="any"
                          value={playerState.played}
                          onMouseDown={handleSeekMouseDown}
                          onChange={handleSeekChange}
                          onMouseUp={handleSeekMouseUp}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex font-medium text-sm gap-[5px]">
                        <span>
                          <Duration
                            seconds={playerState.duration * playerState.played}
                          />
                        </span>
                        <span className="opacity-50">|</span>
                        <span className="opacity-50">
                          <Duration
                            className="opacity-50"
                            seconds={playerState.duration}
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src={VolumeImage} alt="Volume Control" />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={playerState.volume}
                          onChange={(e) => {
                            setPlayerState({
                              ...playerState,
                              volume: parseFloat(e.target.value),
                            });
                            recordAction("volume");
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <select
                        className="border-1 border-[#45474E] text-[white] px-[10px] py-[7px] bg-transparent"
                        value={playerState.playbackRate}
                        onChange={(e) => {
                          setPlayerState({
                            ...playerState,
                            playbackRate: parseFloat(e.target.value),
                          });
                          recordAction("speed");
                        }}
                      >
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                          (value) => (
                            <option
                              className="bg-transparent "
                              key={value}
                              value={value}
                            >
                              {value}x
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <select
                        className="border-1 border-[#45474E] text-[white] px-[10px] py-[7px] bg-transparent"
                        value={(cropSize.width / cropSize.height).toFixed(2)}
                        onChange={(e) => {
                          const aspectRatio = parseFloat(e.target.value);
                          setCropSize({
                            width: cropSize.height * aspectRatio,
                            height: cropSize.height,
                          });
                          recordAction("aspectRatio");
                        }}
                      >
                        <option value={(16 / 9).toFixed(2)}>16:9</option>
                        <option value={(4 / 3).toFixed(2)}>4:3</option>
                        <option value="1.00">1:1</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-col ${
                    cropper ? "" : "justify-between"
                  }  items-center w-full`}
                >
                  <span>Preview</span>

                  <div
                    style={{
                      width: cropSize.width,
                      visibility: cropper ? "visible" : "hidden",
                    }}
                    className="overflow-hidden h-[307px]"
                  >
                    <ReactPlayer
                      style={{
                        marginLeft: `-${position.x}px`,
                      }}
                      // width={position.x}
                      ref={secondPlayer}
                      height={"307px"}
                      muted={true}
                      url={playerState.url}
                      played={playerState.played}
                      playbackRate={playerState.playbackRate}
                      playing={playerState.playing}
                      controls={false}
                    />
                  </div>
                  <div className="ml-4">
                    <h2>Crop Data</h2>
                    <p>X: {position.x}</p>
                    <p>Y: {position.y}</p>
                    <p>
                      Scroll Percentage: {position.scrollPercentageHorizontal}
                    </p>
                  </div>
                  {cropper ? (
                    <div
                      style={{
                        width: cropSize.width,
                      }}
                      className="overflow-hidden h-[307px]"
                    >
                      <ReactPlayer
                        style={{
                          marginLeft: `-${position.x}px`,
                        }}
                        // width={position.x}
                        ref={secondPlayer}
                        muted={true}
                        url={playerState.url}
                        played={playerState.played}
                        playbackRate={playerState.playbackRate}
                        playing={playerState.playing}
                        controls={false}
                      />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center w-full">
                      <Image src={PreviewImage} alt="Preview Image" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab == "generate" && (
              <div className="h-full px-4">
                <ReactPlayer url={outputUrl} controls={true} />
              </div>
            )}
            <div className="border-[#494C55] w-full border-t-[1px] p-4 flex justify-between items-end">
              {tab == "preview" ? (
                <>
                  <div className="flex gap-2">
                    <button
                      disabled={cropper}
                      onClick={() => {
                        setCropper(true);
                        setPlayerState({ ...playerState, playing: false });
                      }}
                      className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px] disabled:opacity-50"
                    >
                      Start Cropper
                    </button>
                    <button
                      disabled={!cropper}
                      onClick={() => setCropper(false)}
                      className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px] disabled:opacity-50"
                    >
                      Remove Cropper
                    </button>
                    <button
                      onClick={() => {
                        console.log(actionList);
                        cropVideo();
                      }}
                      disabled={actionList.length == 0}
                      className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px] disabled:opacity-50"
                    >
                      Generate Preview
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px]">
                      Start Cropper
                    </button>
                    <button className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px]">
                      Remove Cropper
                    </button>
                    <button className="bg-[#7C36D6] text-white text-sm font-medium px-4 py-2 rounded-[10px]">
                      <a href={outputUrl} download="cropped_video.mp4">
                        Download Preview
                      </a>
                    </button>
                  </div>
                </>
              )}
              <button className="bg-[#45474E] text-white text-sm font-medium px-4 py-2 rounded-[10px]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function format(seconds) {
  const date = new Date(seconds * 1000);
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${hh}:${mm}:${ss}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function Duration({ className, seconds }) {
  const timeInSeconds = seconds !== undefined ? seconds : 0;

  return (
    <time dateTime={`P${Math.round(timeInSeconds)}S`} className={className}>
      {format(timeInSeconds)}
    </time>
  );
}