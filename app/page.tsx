import ConfigMenu from "@/components/ConfigMenu";
import ImageReplayer from "@/components/ImageReplayer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex">
      <ConfigMenu />
      <ImageReplayer />
    </div>
  );
}
