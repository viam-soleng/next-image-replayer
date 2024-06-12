"use client";
import React, { FC, useState } from "react";
import ConfigMenu from "@/components/ConfigMenu";
import ImageReplayer from "@/components/ImageReplayer";
import { useLocalStorage, deleteFromStorage } from "@rehooks/local-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LOCALSTORAGE_API_KEY = "API_KEY";

interface ViamInterfaceProps {
  // Define props and propTypes here
}

interface ViamConfig {
  key: string;
  id: string;
}

const ViamInterface: FC<ViamInterfaceProps> = (props) => {
  const [queryClient] = useState(() => new QueryClient());
  const [config, setConfig] = useLocalStorage<ViamConfig>(LOCALSTORAGE_API_KEY);

  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyId, setApiKeyId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfig({ key: apiKey, id: apiKeyId });
  };

  return (
    <div>
      <header className="flex border-b items-center justify-between px-4">
        <h1 className="text-2xl py-4">Viam Image Replayer</h1>
        {config && (
          <div className="opacity-75 px-2 top-2 right-2 flex flex-row items-center outline rounded-md p-1 bg-black gap-2">
            <button
              onClick={() => deleteFromStorage(LOCALSTORAGE_API_KEY)}
              className="text-white"
            >
              Reset Key
            </button>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-rotate-ccw"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </div>
        )}
      </header>
      <main className="flex mx-auto items-stretch h-[calc(100vh-82px)] w-full relative">
        {/* Input for when the config doesn't exist */}
        {!config && (
          <form onSubmit={handleSubmit} className="py-12">
            <div className="pb-4 flex flex-col space-y-2">
              <label className="block text-sm">Please enter your API Key</label>
              <input
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                type="password"
                autoComplete="off"
              />
            </div>
            <div className="pb-4 flex flex-col space-y-2">
              <label className="block text-sm">
                Please enter your API Key ID
              </label>
              <input
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={apiKeyId}
                onChange={(e) => setApiKeyId(e.target.value)}
                placeholder="API Key ID"
                type="password"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md"
            >
              Submit Config
            </button>
          </form>
        )}

        {/* Main page is shown when API key is present */}
        {config && (
          <>
            <div className="flex flex-1">
              <QueryClientProvider client={queryClient}>
                <ConfigMenu apiKey={config.key} apiKeyId={config.id} />
                <ImageReplayer />
              </QueryClientProvider>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ViamInterface;
