import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { StarField } from "./BackgroundLive";
import Tools from "./Tools";
import { useRoomsContext } from "@/provider/roomsContext";
import type { HomeLoader, TLanguage } from "@/types";
import Header from "./Header";
import Rooms from "./Rooms";

const Home = () => {
  const homeLoader: HomeLoader = useLoaderData();
  const [selectedLanguages] = useState<TLanguage[]>([]);
  const { setFilters } = useRoomsContext();

  useEffect(() => {
    setFilters({ languages: selectedLanguages.map((item) => item.value) });
  }, [selectedLanguages]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto font-sans bg-background">
      <StarField />
      <div className="pointer-events-none fixed inset-0 z-1 bg-[radial-gradient(ellipse_at_50%_50%,transparent_55%,oklch(0.07_0.01_240/0.85)_100%)]" />
      <div className="relative z-10 px-6 md:px-10 flex flex-col min-h-screen">
        <Header homeLoader={homeLoader} />
        <main className="flex flex-col flex-1">
          <Tools />
          <Rooms />
        </main>
      </div>
    </div>
  );
};

export default Home;
