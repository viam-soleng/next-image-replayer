"use client";
import { useQuery } from "@tanstack/react-query";
import { Credential } from "@viamrobotics/sdk";
import React, { FC, useEffect, useState } from "react";
import ViamSelect from "./ViamSelect";

interface ConfigMenuProps {
  apiKey: string;
  apiKeyId: string;
}

interface ViamOrg {
  cid: string;
  createdOn: {
    nanos: number;
    seconds: number;
  };
  defaultRegion: string;
  id: string;
  name: string;
  publicNamespace: string;
}

const ConfigMenu: FC<ConfigMenuProps> = (props) => {
  const [selectedOrg, setSelectedOrg] = useState<ViamOrg | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
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

  // do a similar query as above for appClient?.listLocations() and appClient?.listMachines()
  // and use the data to populate the select dropdowns
  const {
    isLoading: locationsIsLoading,
    data: locations,
    isError: getLocationsError,
    error: getLocationsErrorDetails,
  } = useQuery({
    queryKey: ["locations", selectedOrg?.id],
    queryFn: async () => {
      console.log("Querying locations. Selected org:", selectedOrg?.id);
      // Lazy load the Viam TS lib since it needs `window` to be defined
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

      const appClient = viamClient.appClient;
      // pass the selected org id as the argument to listLocations
      if (!selectedOrg) {
        return [];
      }
      const locs = await appClient?.listLocations(selectedOrg?.id as string);
      console.log(locs);
      return locs;
    },
  });

  if (getLocationsError) {
    console.error(getLocationsErrorDetails);
  }

  useEffect(() => {
    console.log("locations", locations);
    if (locations) {
      console.log(locations);
    }
  }, [locations]);

  return (
    <div className="border-r border-gray-500 w-64 p-4">
      <h2 className="text-xl font-bold mb-4">Configuration Menu</h2>
      <ViamSelect
        label="Organization"
        items={orgs}
        isLoading={orgsIsLoading}
        value={selectedOrg}
        onChange={setSelectedOrg}
      />
      <ViamSelect
        label="Location"
        items={locations}
        isLoading={locationsIsLoading}
        value={selectedLocation}
        onChange={setSelectedLocation}
      />
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
