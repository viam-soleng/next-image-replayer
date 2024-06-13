import { create } from "zustand";

type ViamOrg = {
  cid: string;
  createdOn: {
    nanos: number;
    seconds: number;
  };
  defaultRegion: string;
  id: string;
  name: string;
  publicNamespace: string;
};

type ViamLoc = {
  id: string;
  name: string;
};

type ImageReplayerStore = {
  selectedOrg: ViamOrg | null;
  selectedLocation: ViamLoc | null;
  machineName: string;
  machineID: string;
  startTime: string;
  endTime: string;
  setSelectedOrg: (org: ViamOrg | null) => void;
  setSelectedLocation: (location: ViamLoc | null) => void;
  setMachineName: (name: string) => void;
  setMachineID: (id: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
};

export const useStore = create<ImageReplayerStore>((set) => ({
  selectedOrg: null,
  selectedLocation: null,
  machineName: "",
  machineID: "",
  startTime: "",
  endTime: "",
  setSelectedOrg: (org) => set({ selectedOrg: org }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setMachineName: (name) => set({ machineName: name }),
  setMachineID: (id) => set({ machineID: id }),
  setStartTime: (time) => set({ startTime: time }),
  setEndTime: (time) => set({ endTime: time }),
}));
