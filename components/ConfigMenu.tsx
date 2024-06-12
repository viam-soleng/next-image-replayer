"use client";
import React, { FC, useState } from "react";

interface ConfigMenuProps {}

const ConfigMenu: FC<ConfigMenuProps> = () => {
  const [location, setLocation] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineID, setMachineID] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  return (
    <div className="border-r border-gray-500 w-64 p-4">
      <h2 className="text-xl font-bold mb-4">Configuration Menu</h2>
      <div className="mb-4">
        <label className="block mb-1">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select Location</option>
          <option value="location1">Location 1</option>
          <option value="location2">Location 2</option>
          <option value="location3">Location 3</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Machine Name</label>
        <input
          type="text"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Machine ID</label>
        <input
          type="text"
          value={machineID}
          onChange={(e) => setMachineID(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default ConfigMenu;
