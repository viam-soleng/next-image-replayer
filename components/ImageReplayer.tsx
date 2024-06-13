"use client";
import React, { FC, SVGProps, useRef, useState, useEffect } from "react";
import { Credential } from "@viamrobotics/sdk";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store/zustand";

function createFilter({
  selectedOrg,
  selectedLocation,
  machineName,
  machineId,
  startTime,
  endTime,
}: {
  selectedOrg?: any;
  selectedLocation?: any;
  machineName?: string;
  machineId?: string;
  startTime?: string;
  endTime?: string;
}) {
  const filter = {};

  if (selectedOrg) {
    //@ts-ignore
    filter.organization_ids = [selectedOrg.id];
  }

  if (selectedLocation) {
    //@ts-ignore
    filter.location_ids = [selectedLocation.id];
  }

  if (machineName) {
    //@ts-ignore
    filter.component_name = machineName;
  }

  if (machineId) {
    //@ts-ignore
    filter.robot_id = machineId;
  }

  const interval = {};
  if (startTime) {
    //@ts-ignore
    interval.start_time = new Date(startTime).toISOString();
  }
  if (endTime) {
    //@ts-ignore
    interval.end_time = new Date(endTime).toISOString();
  }
  if (Object.keys(interval).length > 0) {
    //@ts-ignore
    filter.interval = interval;
  }

  return filter;
}

interface BinaryDataFilter {
  selectedOrg?: any;
  selectedLocation?: any;
  machineName?: string;
  machineId?: string;
  startTime?: string;
  endTime?: string;
}

interface ImageReplayerProps {
  apiKey: string;
  apiKeyId: string;
}

const ImageReplayer: FC<ImageReplayerProps> = (props) => {
  const { startTime, endTime, selectedOrg, selectedLocation } = useStore();
  const [currentTimePosition, setCurrentTimePosition] = useState(0.3);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filter, setFilter] = useState<BinaryDataFilter>({
    selectedOrg,
    selectedLocation,
    machineName: "",
    machineId: "",
    startTime,
    endTime,
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateTimePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateTimePosition(e);
    }
  };

  const updateTimePosition = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newPosition = Math.max(0, Math.min(1, offsetX / rect.width));
      setCurrentTimePosition(newPosition);
    }
  };

  const dateStartTime = new Date(startTime);
  const dateEndTime = new Date(endTime);
  const duration = dateStartTime.getTime() - dateEndTime.getTime();

  const currentTime = new Date(
    dateStartTime.getTime() + duration * currentTimePosition
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const skipForward = () => {
    setCurrentTimePosition((prev) => Math.min(1, prev + 0.1));
  };

  const skipBackward = () => {
    setCurrentTimePosition((prev) => Math.max(0, prev - 0.1));
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTimePosition((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 0.01;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const {
    isLoading: imagesAreLoading,
    data: images,
    isError: getImagesError,
    error: getImagesErrorDetails,
  } = useQuery({
    queryKey: [
      "images",
      selectedOrg?.id,
      selectedLocation?.id,
      startTime,
      endTime,
    ],
    queryFn: async () => {
      console.log("Querying image data");
      const Viam = await import("@viamrobotics/sdk");

      const viamClientCredential: Credential = {
        authEntity: props.apiKeyId,
        payload: props.apiKey,
        type: "api-key",
      };

      const viamClient = await Viam.createViamClient({
        // serviceHost: process.env.host,
        credential: viamClientCredential,
      });

      const dataClient = viamClient.dataClient;
      const formattedFilter = createFilter(filter);
      console.log("Filter", formattedFilter);

      // const binaryData = await dataClient?.binaryDataByFilter(
      //   // @ts-ignore
      //   formattedFilter,
      //   25,
      //   0
      // );
      const binaryData = await dataClient?.binaryDataByFilter(undefined, 1, 0);
      console.log("Binary Data");
      console.log(JSON.stringify(binaryData, null, 2));
      return binaryData;
    },
  });

  useEffect(() => {
    setFilter({
      selectedOrg,
      selectedLocation,
      machineName: "",
      machineId: "",
      startTime,
      endTime,
    });
  }, [selectedOrg, selectedLocation, startTime, endTime]);

  return (
    <div
      className="relative w-full" // how do i make this take up the full available width??
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* <img
        src="/placeholder.svg"
        alt="Replay footage"
        className="w-full h-auto"
      /> */}
      <div className="w-full h-auto">
        {imagesAreLoading && <p>Loading images...</p>}
        {getImagesError && (
          <p className="text-red">Error: {getImagesErrorDetails.message}</p>
        )}
        {images && (
          <img
            src={`data:image/jpeg;base64,${images.data[0].binary}`}
            alt="Replay footage"
            className="w-full h-auto"
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md"
              onClick={skipBackward}
            >
              <SkipBackIcon className="text-white" />
            </button>
            <button
              className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseIcon className="text-white" />
              ) : (
                <PlayIcon className="text-white" />
              )}
            </button>
            <button
              className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md"
              onClick={skipForward}
            >
              <SkipForwardIcon className="text-white" />
            </button>
          </div>
          {/* <div className="flex items-center space-x-2">
            <button className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md">
              <SettingsIcon className="text-white" />
            </button>
            <button className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md">
              <FullscreenIcon className="text-white" />
            </button>
            <button className="bg-transparent hover:bg-gray-100 text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400 py-2 px-4 rounded-md">
              <DoorClosedIcon className="text-white" />
            </button>
          </div> */}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-xs font-medium text-white">11:07 AM</span>
          <div
            className="flex-1 h-1 bg-white relative cursor-pointer"
            ref={timelineRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div
              className="h-1 bg-red-500 absolute"
              style={{ width: `${currentTimePosition * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-white">11:17 AM</span>
        </div>
        <div className="mt-1 flex items-center justify-center space-x-1">
          <span className="text-xs font-medium text-white">Wed 08/02/2023</span>
          <span className="text-xs font-medium text-white">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageReplayer;

function DoorClosedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
}

function FastForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function FullscreenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect width="10" height="8" x="7" y="8" rx="1" />
    </svg>
  );
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function RewindIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SkipBackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" x2="5" y1="19" y2="5" />
    </svg>
  );
}

function SkipForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" x2="19" y1="5" y2="19" />
    </svg>
  );
}
