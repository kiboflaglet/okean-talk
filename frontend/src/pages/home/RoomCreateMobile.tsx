import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useDrawerStack } from "@/hooks/useDrawerStack";
import {
  Check,
  ChevronRight,
  Dice4,
  Globe,
  Loader,
  Plus,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { cn } from "../../lib/utils";
import { Languages, type HomeLoader } from "../../types";
import { type RoomFormValues } from "./roomSchema";
import SignInButton from "./SignInButton";

type RoomCreateMobileProps = {
  userData: HomeLoader["userData"];
  loadingRandomTopic: boolean;
  loadingForm: boolean;
  canCreate: boolean;
  form: UseFormReturn<RoomFormValues>;
  pickRandomTopic: () => void;
  onSubmit: (data: RoomFormValues) => void;
  onError: (error: any) => void;
};

export const RoomCreateMobile = ({
  userData,
  loadingRandomTopic,
  loadingForm,
  canCreate,
  form,
  pickRandomTopic,
  onSubmit,
  onError,
}: RoomCreateMobileProps) => {
  const { open, close, states } = useDrawerStack(3);
  const [roomCreateFormOpen, langDrawerOpen, participantsDrawerOpen] = states;

  const openMainDrawer = () => open(0);
  const closeMainDrawer = () => close(0);
  const openLangDrawer = () => open(1);
  const closeLangDrawer = () => close(1);
  const openMaxParticipants = () => open(2);
  const closeMaxParticipants = () => close(2);

  const handleSubmit = async (data: RoomFormValues) => {
    await onSubmit(data);
    closeMainDrawer();
  };

  return (
    <Drawer
      onOpenChange={(open) => {
        if (open) openMainDrawer();
        else closeMainDrawer();
      }}
      open={roomCreateFormOpen}
    >
      <DrawerTrigger asChild>
        <Button disabled={!canCreate}>
          <Plus className="w-8 h-8" />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        {userData ? (
          <>
            <DrawerHeader>
              <DrawerTitle>Create a new room</DrawerTitle>
              <DrawerDescription>
                You can change room settings later
              </DrawerDescription>
            </DrawerHeader>

            <form
              className="overflow-y-auto"
              onSubmit={form.handleSubmit(handleSubmit, onError)}
            >
              <FieldGroup className="px-4">
                <Controller
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Topic in your head
                      </FieldLabel>
                      <InputGroup className="items-center ">
                        <InputGroupTextarea
                          className="min-h-2"
                          {...field}
                          id={field.name}
                          placeholder="Custom or random topic name"
                        />
                        <InputGroupAddon align={"inline-end"}>
                          <Button
                            className={""}
                            onClick={(e) => {
                              e.preventDefault();
                              pickRandomTopic();
                            }}
                          >
                            {loadingRandomTopic ? (
                              <Loader className="animate-spin" />
                            ) : (
                              <Dice4 className="group-hover:animate-pulse" />
                            )}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  )}
                />

                <Controller
                  name="languages"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Language (Up to 3)</FieldLabel>

                      <Button
                        variant={"outline"}
                        onClick={openLangDrawer}
                        className={
                          "py-4.5 px-3 text-md transition-colors justify-between"
                        }
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Globe className="w-4 h-4 text-gray-9 shrink-0" />
                          {field.value?.length > 0 ? (
                            <span className="text-gray-12 truncate">
                              {field.value
                                .map(
                                  (v) =>
                                    Languages.find((l) => l.value === v)?.label
                                )
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          ) : (
                            <span className="text-gray-11">
                              Choose languages…
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0 ml-2">
                          {field.value?.length > 0 && (
                            <span className="text-xs bg-gray-6 text-gray-11 rounded-full px-1.5 py-0.5">
                              {field.value.length}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-9" />
                        </span>
                      </Button>

                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}

                      <LanguagePickerDrawer
                        open={langDrawerOpen}
                        onClose={() => {
                          closeLangDrawer();
                        }}
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="maxParticipants"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Max participants</FieldLabel>

                      <Button
                        variant={"outline"}
                        onClick={openMaxParticipants}
                        className={
                          "py-4.5 px-3 text-md transition-colors justify-between"
                        }
                      >
                        <span className="flex items-center gap-2 text-gray-11">
                          <Users className="w-4 h-4 text-gray-9 shrink-0" />
                          {field.value ? (
                            <span className="text-gray-12">
                              {field.value} participants
                            </span>
                          ) : (
                            <span>Choose limit…</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0 ml-2">
                          {field.value && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(null);
                              }}
                              className="text-gray-9 hover:text-gray-12"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-9" />
                        </span>
                      </Button>

                      <MaxParticipantsDrawer
                        open={participantsDrawerOpen}
                        onClose={closeMaxParticipants}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>

              <DrawerFooter>
                <Button
                  type="submit"
                  className={"py-4.5 text-md"}
                  disabled={loadingForm}
                >
                  Create {loadingForm && <Loader className="animate-spin" />}
                </Button>
              </DrawerFooter>
            </form>
          </>
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle>Sign in</DrawerTitle>
              <DrawerDescription>
                You need to have an account to create a room
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 w-full shrink-0 mb-4">
              <SignInButton showTitle />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

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

function MaxParticipantsDrawer({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: number | null;
  onChange: (val: number) => void;
}) {
  const options = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[70vh]" backButton>
        <DrawerHeader>
          <DrawerTitle>Max Participants</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-3 pb-8 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {options.map((n) => {
              const selected = value === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onChange(n);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? "bg-gray-12 text-gray-1 border-gray-12"
                      : "bg-gray-3 border-gray-6 text-gray-11 hover:bg-gray-5 hover:text-gray-12"
                  }`}
                >
                  {n === 1 ? (
                    <>
                      <User
                        className={`w-4 h-4 mb-1 ${
                          selected ? "text-gray-1" : "text-gray-9"
                        }`}
                      />
                      {n}
                    </>
                  ) : (
                    <>
                      <Users
                        className={`w-4 h-4 mb-1 ${
                          selected ? "text-gray-1" : "text-gray-9"
                        }`}
                      />
                      {n}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
