import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadSelect,
} from "@/components/ui/select";
import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { handleError } from "@/lib/errorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dice4, Loader, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { RandomTopics } from "../../data";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { sleep } from "../../lib/utils";
import { useRoomsContext } from "../../provider/roomsContext";
import { Languages, type HomeLoader } from "../../types";
import { RoomCreateMobile } from "./RoomCreateMobile";
import { roomSchema, type RoomFormValues } from "./roomSchema";
import SignInButton from "./SignInButton";

type RoomCreateProps = {
  canCreate: boolean;
};

export function RoomCreate({ canCreate }: RoomCreateProps) {
  const { addRoom } = useRoomsContext();
  const { isMobile } = useBreakpoint();
  const loaderData: HomeLoader = useLoaderData();
  const [randomAvaialableCount, setRandomAvaialableCount] = useState<number>(3);
  const [loadingRandomTopic, setLoadingRandomTopic] = useTransition();
  const [loadingForm, setLoadingForm] = useTransition();
  const [roomCreateFormOpen, setRoomCreateFormOpen] = useState(false);
  const [langDrawerOpen, setLangDrawerOpen] = useState(false);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      topic: "",
      languages: ["en"],
      maxParticipants: 5,
    },
    resolver: zodResolver(roomSchema),
  });

  const pickRandomTopic = async () => {
    setLoadingRandomTopic(async () => {
      const randomIndex = Math.floor(Math.random() * RandomTopics.length);
      const randomTopic = RandomTopics[randomIndex];
      setRandomAvaialableCount(randomAvaialableCount - 1);
      await sleep(400, "processing the random topic");
      form.setValue("topic", randomTopic);
    });
  };

  const onSubmit = (data: RoomFormValues) => {
    if (!canCreate) return;
    if (!loaderData?.userData) return;

    setLoadingForm(async () => {
      await addRoom({
        topic: data.topic,
        languages: data.languages,
        maxParticipants: data.maxParticipants,
        ownerId: loaderData.userData?.id,
      });

      setRoomCreateFormOpen(false);
    });
  };

  const onError = (error: any) => {
    handleError("Something error", "form error", error);
  };

  const handleClose = () => {
    form.reset();
    setRoomCreateFormOpen(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  useBackButtonClose(
    roomCreateFormOpen && !langDrawerOpen && !participantsDrawerOpen,
    () => {
      form.reset();
      setRoomCreateFormOpen(false);
    }
  );

  useBackButtonClose(participantsDrawerOpen, () => {
    setParticipantsDrawerOpen(false);
  });

  useBackButtonClose(langDrawerOpen, () => {
    setLangDrawerOpen(false);
  });

  if (isMobile) {
    return (
      <RoomCreateMobile
        userData={loaderData.userData}
        loadingForm={loadingForm}
        loadingRandomTopic={loadingRandomTopic}
        canCreate={canCreate}
        form={form}
        pickRandomTopic={pickRandomTopic}
        onSubmit={onSubmit}
        onError={onError}
      />
    );
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          if (!canCreate) return;
          setRoomCreateFormOpen(open);
        } else {
          handleClose();
        }
      }}
      open={roomCreateFormOpen}
    >
      <DialogTrigger>
        <Button disabled={!canCreate} className={"py-4"}>
          <Plus className="size-4" /> {!isMobile && "Create room"}
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-2xl ">
        {loaderData?.userData ? (
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader className="mb-5 ">
              <DialogTitle className={"text-3xl font-bold text-center"}>
                Create a room
              </DialogTitle>
            </DialogHeader>

            <FieldGroup>
              <Controller
                control={form.control}
                name="topic"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name} className="text-xl">
                      Topic?
                    </FieldLabel>
                    <InputGroup className="items-center ">
                      <InputGroupTextarea
                        className="min-h-1 text-sm! "
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
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="languages"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className={"text-xl"}>
                      Language (Up to 3)
                    </FieldLabel>
                    <MultiSelect
                      defaultValues={field.value}
                      onValuesChange={(e) => field.onChange(e)}
                    >
                      <MultiSelectTrigger className="w-full">
                        <MultiSelectValue placeholder="Select languages..." />
                      </MultiSelectTrigger>
                      <MultiSelectContent
                        className="text-lg "
                        search={{ placeholder: "Search languages..." }}
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
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="maxParticipants"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-lg">Maximum people</FieldLabel>
                    <ShadSelect
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadSelect>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter className="mt-5">
              <DialogClose>
                <Button variant={"outline"} className="text-lg py-4.5 px-6">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className={"text-lg py-4.5 px-6"}
                type="submit"
                disabled={loadingForm}
              >
                Create {loadingForm && <Loader className="animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader className="mb-5">
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                You need to sign up to create a room
              </DialogDescription>
            </DialogHeader>
            <SignInButton showTitle />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
