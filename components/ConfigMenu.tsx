"use client";
import { useQuery } from "@tanstack/react-query";
import { Credential } from "@viamrobotics/sdk";
import React, { FC, useEffect, useState } from "react";

interface ConfigMenuProps {
  apiKey: string;
  apiKeyId: string;
}

const ConfigMenu: FC<ConfigMenuProps> = (props) => {
  const [location, setLocation] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineID, setMachineID] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const {
    isLoading: orgsIsLoading,
    data: orgs,
    refetch,
    isError: getOrgsError,
    error: getOrgsErrorDetails,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      // Lazy load the Viam TS lib since it needs `window` to be defined
      const Viam = await import("@viamrobotics/sdk");

      const viamClientCredential: Credential = {
        authEntity: props.apiKeyId,
        payload: props.apiKey,
        type: "api-key",
      };

      console.log("viamClientCredential", viamClientCredential);

      const viamClient = await Viam.createViamClient({
        // serviceHost: process.env.host,
        credential: viamClientCredential,
      });

      const appClient = viamClient.appClient;
      const orgs = await appClient?.listOrganizations();
      return orgs;
    },
  });

  if (getOrgsError) {
    console.error(getOrgsErrorDetails);
  }

  useEffect(() => {
    console.log("orgs", orgs);
    if (orgs) {
      console.log(orgs);
    }
  }, [orgs]);

  return (
    <div className="border-r border-gray-500 w-64 p-4">
      <h2 className="text-xl font-bold mb-4">Configuration Menu</h2>
      <div className="mb-4">
        <label className="block mb-1">Organization</label>
        {orgsIsLoading ? (
          <div>Loading...</div>
        ) : (
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select Organization</option>
            {orgs?.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>
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
