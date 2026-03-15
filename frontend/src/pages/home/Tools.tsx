import {
  Check,
  ChevronRight,
  Globe,
  ListFilter,
  Search,
  X,
} from "lucide-react";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { Languages, type HomeLoader, type TLanguage } from "../../../src/types";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { cn } from "../../lib/utils";
import { useRoomsContext } from "../../provider/roomsContext";
import { RoomCreate } from "./room-create";

const Tools = () => {
  const homeLoader: HomeLoader = useLoaderData();
  const [selectedLanguages, setSelectedLanguages] = useState<TLanguage[]>([]);
  const { isMobile } = useBreakpoint();
  const [openMobileFilters, setOpenMobileFilters] = useState(false);
  const { setFilters, rooms } = useRoomsContext();
  const [langDrawerOpen, setLangDrawerOpen] = useState(false);

  useEffect(() => {
    setFilters({ languages: selectedLanguages.map((item) => item.value) });
  }, [selectedLanguages]);

  const handleClose = () => {
    setOpenMobileFilters(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  useBackButtonClose(openMobileFilters, () => {
    setOpenMobileFilters(false);
  });

  return (
    <div
      className={cn(
        "flex items-center gap-4 mt-6",
        isMobile && "justify-between"
      )}
    >
      <RoomCreate
        canCreate={
          !rooms.find((item) => item.ownerId === homeLoader?.userData?.id)
        }
      />
      <div className="min-w-0 flex-1">
        <InputGroup className=" w-full py-4  backdrop-blur-md transition-colors">
          <InputGroupAddon className="text-foreground/30">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="text-xs  bg-transparent placeholder:text-foreground/30"
            placeholder="Search rooms..."
          />
        </InputGroup>
      </div>

      {isMobile ? (
        <>
          <Drawer
            open={openMobileFilters}
            onOpenChange={(open) => {
              !open ? handleClose() : setOpenMobileFilters(open);
            }}
          >
            <DrawerTrigger asChild>
              <Button
                onClick={() => setOpenMobileFilters(true)}
                variant="ghost"
                className="border-muted text-foreground/30"
              >
                <div className="relative">
                  <ListFilter className="size-4" />
                  {selectedLanguages.length > 0 && (
                    <div className="bg-destructive/50 rounded-full size-2 absolute -top-2 -right-2"></div>
                  )}
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="">
              <DrawerHeader>
                <DrawerTitle className="text-white">Filters</DrawerTitle>
              </DrawerHeader>
              <div className="px-4">
                <Button
                  variant={"outline"}
                  onClick={() => setLangDrawerOpen(true)}
                  className={
                    "w-full py-4.5 px-3 text-md transition-colors justify-between"
                  }
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-gray-9 shrink-0" />
                    {selectedLanguages?.length > 0 ? (
                      <span className="text-gray-12 truncate">
                        {selectedLanguages
                          .map((v) => Languages.find((l) => l === v)?.label)
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-gray-11">Filter by languages</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                    {selectedLanguages?.length > 0 && (
                      <span className="text-xs bg-gray-6 text-gray-11 rounded-full px-1.5 py-0.5">
                        {selectedLanguages.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-9" />
                  </span>
                </Button>
              </div>

              <LanguagePickerDrawer
                open={langDrawerOpen}
                onClose={() => {
                  setLangDrawerOpen(false);
                }}
                value={selectedLanguages.map((item) => item.value) ?? []}
                onChange={(values) => {
                  setSelectedLanguages(
                    Languages.filter((lang) => values.includes(lang.value))
                  );
                }}
              />

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    className={
                      "text-sm py-4.5 px-6 bg-foreground text-background"
                    }
                  >
                    Done
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div style={{ width: 380 }}>
          <MultiSelect
            onValuesChange={(values) =>
              setSelectedLanguages(
                Languages.filter((lang) => values.includes(lang.value))
              )
            }
          >
            <MultiSelectTrigger className="w-full">
              <MultiSelectValue placeholder="Filter by languages" />
            </MultiSelectTrigger>
            <MultiSelectContent
              className="text-lg "
              search={{ placeholder: "Search languages..." }}
              popoverClassname="w-94"
            >
              <MultiSelectGroup>
                {Languages.map((lang) => (
                  <MultiSelectItem
                    key={lang.value}
                    value={lang.value}
                    className="text-lg!"
                  >
                    {lang.label}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        </div>
      )}
    </div>
  );
};

export default Tools;

function LanguagePickerDrawer({
  open,
  onClose,
  value = [],
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      Languages.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh] flex flex-col" backButton>
        <DrawerHeader>
          <DrawerTitle>Select Languages</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 min-w-0   relative ">
          <InputGroup className=" w-full   backdrop-blur-md transition-colors py-4">
            <InputGroupAddon className="text-foreground/30">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              className="text-xs  bg-transparent placeholder:text-foreground/30 "
              placeholder="Search lanugages..."
            />
          </InputGroup>

          {value.length > 0 && (
            <div className=" py-3 flex flex-wrap gap-1.5 shrink-0 ">
              {value.map((v) => {
                const lang = Languages.find((l) => l.value === v);
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-5 border border-gray-7 text-xs text-gray-12"
                  >
                    {lang?.label}
                    <button
                      type="button"
                      onClick={() => toggle(v)}
                      className="text-gray-9 hover:text-gray-12"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-9 py-8">
              No languages found
            </p>
          )}
          {filtered.map((lang) => {
            const selected = value.includes(lang.value);
            return (
              <Button
                key={lang.value}
                variant={"ghost"}
                onClick={() => toggle(lang.value)}
                className={cn(
                  " whitespace-normal w-full  justify-between px-3 py-4.5 text-sm transition-colors",
                  selected
                    ? "bg-gray-5 border border-gray-7 text-gray-12"
                    : "hover:bg-gray-4 text-gray-11 hover:text-gray-12"
                )}
              >
                <span>{lang.label}</span>
                {selected && <Check className="w-4 h-4 text-green-9" />}
              </Button>
            );
          })}
        </div>

        <DrawerFooter className="pt-2 shrink-0">
          <Button
            className={"py-4.5"}
            type="button"
            onClick={onClose}
            disabled={value.length === 0}
          >
            Done{value.length > 0 ? ` (${value.length} selected)` : ""}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
