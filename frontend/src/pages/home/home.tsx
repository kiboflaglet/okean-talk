import {
  HomeIcon,
  Languages,
  Lightbulb,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import Rooms from "./rooms";
import { RoomCreate } from "./room-create";

const Home = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-2 font-sans text-gray-12">
      <aside className="[&>div]:cursor-pointer flex w-20 flex-col items-center border-r border-gray-4 bg-color-gray-1 py-6">
        <div className="mb-10 h-8 w-8 rounded  flex justify-center items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <HomeIcon />
            </TooltipTrigger>
            <TooltipContent className="text-sm" side="right" sideOffset={10}>
              Rooms
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col gap-8">
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Users />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Friends
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Settings />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Settings
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <User />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Profile
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto px-8 ">
        <header className="flex items-center justify-between mt-6   ">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Okean Talk</h1>
            <RoomCreate />
          </div>
        </header>

        <div className="flex items-center gap-4  mt-5  ">
          <div className="">
            <InputGroup className="rounded-2xl h-7  text-2xl   ">
              <InputGroupAddon className="text-xs text-gray-9">
                <Search />
              </InputGroupAddon>
              <InputGroupInput className="text-xs " placeholder="Search ..." />
            </InputGroup>
          </div>
          <div className="flex items-center gap-2 ">
            <Button
              className="rounded-2xl bg-gray-4 text-gray-12 hover:bg-gray-5"
              size={"sm"}
            >
              <Lightbulb />
              <span className="font-bold">Filter by topic:</span>
              <span>Any</span>
            </Button>

            <Button
              className="rounded-2xl bg-gray-4 text-gray-12 hover:bg-gray-5"
              size={"sm"}
            >
              <Languages />
              <span className="font-bold">Filter by language:</span>
              <span>Any</span>
            </Button>
          </div>
        </div>

        <Rooms />

        {/* <section className="grid grid-cols-1 gap-6  pb-10 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
          <div className="h-64 rounded-xl border border-[var(--color-gray-4)] bg-[var(--color-gray-1)] shadow-sm"></div>
        </section> */}
      </main>
    </div>
  );
};

export default Home;
