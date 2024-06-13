"use client";
import { useQuery } from "@tanstack/react-query";
import { Credential } from "@viamrobotics/sdk";
import React, { FC, useEffect } from "react";
import ViamSelect from "./ViamSelect";
import { useStore } from "../store/zustand";

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
  const {
    selectedOrg,
    setSelectedOrg,
    selectedLocation,
    setSelectedLocation,
    machineName,
    setMachineName,
    machineID,
    setMachineID,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  } = useStore();

  const {
    isLoading: orgsIsLoading,
    data: orgs,
    isError: getOrgsError,
    error: getOrgsErrorDetails,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const Viam = await import("@viamrobotics/sdk");

      const viamClientCredential: Credential = {
        authEntity: props.apiKeyId,
        payload: props.apiKey,
        type: "api-key",
      };

      const viamClient = await Viam.createViamClient({
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

  const {
    isLoading: locationsIsLoading,
    data: locations,
    isError: getLocationsError,
    error: getLocationsErrorDetails,
  } = useQuery({
    queryKey: ["locations", selectedOrg?.id],
    queryFn: async () => {
      console.log("Querying locations. Selected org:", selectedOrg?.id);
      const Viam = await import("@viamrobotics/sdk");

      const viamClientCredential: Credential = {
        authEntity: props.apiKeyId,
        payload: props.apiKey,
        type: "api-key",
      };

      const viamClient = await Viam.createViamClient({
        credential: viamClientCredential,
      });

      const appClient = viamClient.appClient;
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
        onChange={(targetVal: string) => {
          if (!targetVal) return;
          console.log("Selected org input val:", targetVal);
          const org = orgs?.find((org: any) => org.name === targetVal);
          console.log("Selected org:", org);
          //@ts-ignore
          setSelectedOrg(org);
        }}
      />
      <ViamSelect
        label="Location"
        items={locations}
        isLoading={locationsIsLoading}
        value={selectedLocation?.id}
        onChange={(targetVal: string) => {
          const selectedLocation = locations?.find((loc: any) => {
            console.log(JSON.stringify(loc, null, 2));
            return loc.id == targetVal;
          });

          //@ts-ignore
          setSelectedLocation(selectedLocation);
        }}
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
