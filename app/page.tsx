import dynamic from "next/dynamic";
const ViamInterface = dynamic(() => import("@/components/ViamInterface"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="">
      <ViamInterface />
    </div>
  );
}
