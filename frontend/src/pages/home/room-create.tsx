import { useRoomsContext } from "../../provider/roomsContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Dice4, Loader, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Button } from "../../components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "../../components/ui/button-group";
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
import { Input } from "../../components/ui/input";
import { RandomTopics } from "../../data";
import { Languages, type HomeLoader } from "../../types";
import { roomSchema, type RoomFormValues } from "./roomSchema";
import { useLoaderData } from "react-router";
import SignInButton from "./sign-in-button";
import { sleep } from "../../lib/utils";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";

export function RoomCreate() {
  const { addRoom } = useRoomsContext();
  const { isMobile } = useBreakpoint();
  const loaderData: HomeLoader = useLoaderData();
  const [randomAvaialableCount, setRandomAvaialableCount] = useState<number>(3);
  const [loadingRandomTopic, setLoadingRandomTopic] = useTransition();
  const [loadingForm, setLoadingForm] = useTransition();
  const [roomCreateFormOpen, setRoomCreateFormOpen] = useState(false);
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
    if (!loaderData?.userData) return;

    setLoadingForm(() => {
      addRoom({
        topic: data.topic,
        languages: data.languages,
        maxParticipants: data.maxParticipants,
        ownerId: loaderData.userData?.id,
      });

      setRoomCreateFormOpen(false);
    });
  };

  const onError = (error: any) => {
    console.log(error);
  };

  if (isMobile) {
    return (
      <Drawer onOpenChange={setRoomCreateFormOpen} open={roomCreateFormOpen}>
        <DrawerTrigger asChild>
          <Button>
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          {loaderData?.userData ? (
            <>
              <DrawerHeader>
                <DrawerTitle>Create a new room</DrawerTitle>
                <DrawerDescription>
                  You can change room settings later
                </DrawerDescription>
              </DrawerHeader>

              <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <FieldGroup className="px-4">
                  <Controller
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Topic in your head
                        </FieldLabel>
                        <ButtonGroup className="items-center">
                          <Input
                            className="bg-gray-4 text-gray-12 outline-none border text-[14px]  "
                            {...field}
                            id={field.name}
                            placeholder="Custom or random topic name"
                          />
                          <ButtonGroupSeparator>
                            <div className="h-full w-2  bg-gray-1"></div>
                          </ButtonGroupSeparator>
                          <Button
                            type="button"
                            className="h-8.5 group bg-gray-6 text-gray-12 hover:bg-gray-8"
                            onClick={(e) => {
                              e.preventDefault();
                              pickRandomTopic();
                            }}
                          >
                            {loadingRandomTopic ? (
                              <Loader className="animate-spin" />
                            ) : (
                              <Dice4 className="group-hover:animate-pulse " />
                            )}{" "}
                          </Button>
                        </ButtonGroup>
                      </Field>
                    )}
                  />
                  <Controller
                    name="languages"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Select language</FieldLabel>
                        <Select
                          value={Languages.filter((opt) =>
                            field.value?.includes(opt.value)
                          )}
                          isMulti
                          options={Languages}
                          onChange={(selected) => {
                            field.onChange(selected.map((opt) => opt.value));
                          }}
                          menuPlacement="top"
                          menuPosition="absolute"
                          classNamePrefix={"react-select"}
                          className="select-style"
                        />
                        {fieldState.error && (
                          <FieldError>Pick up a language</FieldError>
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="maxParticipants"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Max participants</FieldLabel>

                        <Select
                          options={Array.from({ length: 20 }, (_, i) => {
                            const n = (i + 1).toString();
                            return { value: n, label: n };
                          })}
                          value={
                            field.value
                              ? {
                                  value: String(field.value),
                                  label: String(field.value),
                                }
                              : null
                          }
                          onChange={(option) => field.onChange(option?.value)}
                          isClearable
                          menuPlacement="top"
                          menuPosition="absolute"
                          classNamePrefix={"react-select"}
                          className="select-style"
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <DrawerFooter>
                  <Button type="submit" disabled={loadingForm}>
                    Create {loadingForm && <Loader className="animate-spin" />}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel </Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </>
          ) : (
            <>
              <DrawerHeader>
                <DrawerTitle>Sign in</DrawerTitle>
                <DrawerDescription>
                  You need to sign up to create a room
                </DrawerDescription>
              </DrawerHeader>
              <SignInButton showTitle />
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setRoomCreateFormOpen} open={roomCreateFormOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-8 h-8" /> {!isMobile && "Create room"}
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-xl sm:max-w-sm  ">
        {loaderData?.userData ? (
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <DialogHeader className="mb-5">
              <DialogTitle>Create a room</DialogTitle>
            </DialogHeader>

            <FieldGroup>
              <Controller
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Topic in your head
                    </FieldLabel>
                    <ButtonGroup className="items-center">
                      <Input
                        className="bg-gray-4 text-gray-12 outline-none border text-[14px]  "
                        {...field}
                        id={field.name}
                        placeholder="Custom or random topic name"
                      />
                      <ButtonGroupSeparator>
                        <div className="h-full w-2  bg-gray-1"></div>
                      </ButtonGroupSeparator>
                      <Button
                        type="button"
                        className="h-8.5 group bg-gray-6 text-gray-12 hover:bg-gray-8"
                        onClick={(e) => {
                          e.preventDefault();
                          pickRandomTopic();
                        }}
                      >
                        {loadingRandomTopic ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <Dice4 className="group-hover:animate-pulse " />
                        )}{" "}
                        Random
                      </Button>
                    </ButtonGroup>
                  </Field>
                )}
              />
              <div className="flex gap-2 w-full">
                <Controller
                  name="languages"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Select language</FieldLabel>
                      <Select
                        value={Languages.filter((opt) =>
                          field.value?.includes(opt.value)
                        )}
                        isMulti
                        options={Languages}
                        onChange={(selected) => {
                          field.onChange(selected.map((opt) => opt.value));
                        }}
                        menuPlacement="bottom"
                        menuPosition="absolute"
                        classNamePrefix={"react-select"}
                        className="select-style"
                      />
                      {fieldState.error && (
                        <FieldError>Pick up a language</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="maxParticipants"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Max participants</FieldLabel>

                      <Select
                        options={Array.from({ length: 20 }, (_, i) => {
                          const n = (i + 1).toString();
                          return { value: n, label: n };
                        })}
                        value={
                          field.value
                            ? {
                                value: String(field.value),
                                label: String(field.value),
                              }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value)}
                        isClearable
                        menuPlacement="bottom"
                        menuPosition="absolute"
                        classNamePrefix={"react-select"}
                        className="select-style"
                      />
                    </Field>
                  )}
                />
              </div>

              {/* use react-select here to implement multiple language selection and */}
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button className="bg-gray-5 text-gray-12 hover:bg-gray-6">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loadingForm}>
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
