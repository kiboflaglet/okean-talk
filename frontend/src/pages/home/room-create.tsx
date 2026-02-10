import { zodResolver } from "@hookform/resolvers/zod";
import { Dice4, Loader } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Select from "react-select";
import { type AppDispatch } from "../../app/store";
import { Button } from "../../components/ui/button";
import { ButtonGroup } from "../../components/ui/button-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { RandomTopics } from "../../data";
import { addRoom } from "../../features/rooms/roomSlice";
import type { IRoom } from "../../interfaces";
import { Languages } from "../../types";
import { roomSchema, type RoomFormValues } from "./roomSchema";

export function RoomCreate() {
  const dispatch = useDispatch<AppDispatch>();
  const [randomAvaialableCount, setRandomAvaialableCount] = useState<number>(3);
  const [loadingRandomTopic, setLoadingRandomTopic] = useTransition();
  const [loadingForm, setLoadingForm] = useTransition();
  const [roomCreateFormOpen, setRoomCreateFormOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      topic: "",
      languages: ["en"],
      maxParticipants: 10,
    },
    resolver: zodResolver(roomSchema),
  });

  const sleep = async (ms: number, message: string) => {
    // I believe i will use AI someday for this, but this is classic approach ig
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(message);
      }, ms);
    });
  };

  const pickRandomTopic = async () => {
    if (randomAvaialableCount > 0) {
      setLoadingRandomTopic(async () => {
        const randomIndex = Math.floor(Math.random() * RandomTopics.length);
        const randomTopic = RandomTopics[randomIndex];
        setRandomAvaialableCount(randomAvaialableCount - 1);
        await sleep(400, "processing the random topic");
        form.setValue("topic", randomTopic);
      });
    }
  };

  const onSubmit = (data: RoomFormValues) => {
    setLoadingForm(() => {
      const request: IRoom = {
        id: crypto.randomUUID(),
        topic: data.topic,
        ownerId: "user-1",
        languages: data.languages,
        createdAt: new Date().toUTCString(),
        maxParticipants: data.maxParticipants,
      };
      dispatch(addRoom(request));
      setRoomCreateFormOpen(false);
      console.log(data);
    });
  };

  const onError = (error: any) => {
    console.log(error);
  };

  return (
    <Dialog onOpenChange={setRoomCreateFormOpen} open={roomCreateFormOpen}>
      <DialogTrigger asChild>
        <Button>
          <span>+</span> Create room
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-xl sm:max-w-sm  ">
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
                  <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
                  <ButtonGroup>
                    <Input {...field} id={field.name} placeholder="" />
                    <Button
                      onClick={pickRandomTopic}
                      disabled={
                        randomAvaialableCount <= 0 || loadingRandomTopic
                      }
                    >
                      <Dice4 /> Random ({randomAvaialableCount}){" "}
                      {loadingRandomTopic && (
                        <Loader className="animate-spin" />
                      )}
                    </Button>
                  </ButtonGroup>
                </Field>
              )}
            />
            <div className="flex gap-2 w-full">
              <Controller
                name="languages"
                control={form.control}
                render={({ field }) => (
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
      </DialogContent>
    </Dialog>
  );
}
