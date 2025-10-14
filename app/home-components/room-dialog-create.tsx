import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchSupabase } from "@/lib/apiHandler"
import { RoomService } from "@/lib/services/room.service"
import { createClient } from "@/lib/supabase/client"
import { Room } from "@/lib/types"
import { room, RoomInput } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { MinusIcon, Plus, PlusIcon } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Button as ButtonRAC, Group as GroupRAC, Input as InputRAC, Label as LabelRAC, NumberField } from 'react-aria-components'
import { useUser } from "@/hooks/use-user"


const roomService = new RoomService()

export function RoomDialogCreate(
    {
        ...props
    }: {
        isEditing: boolean;
        onClose: () => void;
        selectedRoom: Room | null;
    }
) {

    const { loading, error, user } = useUser()

    const [isPending, setPending] = useTransition()
    const supabase = createClient()

    const [open, setOpen] = useState(props.isEditing);
    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            props.onClose();
        }
    };

    useEffect(() => {
        setOpen(props.isEditing);
    }, [props.isEditing]);


    const {
        register,
        control,
        handleSubmit,
        reset
    } = useForm<RoomInput>({
        resolver: zodResolver(room),
        defaultValues: {
            name: "",
            limit: 0,
        },
    })

    const onSubmit = async (request: RoomInput) => {
        setPending(async () => {

            if (props.isEditing) {

                const { error } = await fetchSupabase<Room>(async () => {
                    return supabase
                        .from("rooms")
                        .update({
                            ...request
                        })
                        .eq("id", props.selectedRoom?.id);
                })
                if (error) {
                    toast("Error occured", {
                        description: `${error.message}`,
                    });
                } else {
                    toast("Room updated");
                }

            } else {

                const { error } = await fetchSupabase<Room>(async () => {
                    return supabase
                        .from("rooms")
                        .insert({
                            ...request,
                            owner_id: user?.id
                        });
                })
                if (error) {
                    toast("Error occured", {
                        description: `${error.message}`,
                    });
                } else {
                    toast("Room created");
                    setOpen(false)
                }
            }



        })

    };

    const onError = (errors: any) => {
        toast("Validation failed", { description: Object.values(errors).map((e: any) => e.message).join(", ") });
    };

    useEffect(() => {
        if (props.isEditing && props.selectedRoom) {
            reset({
                name: props.selectedRoom.name ?? "",
                limit: props.selectedRoom.limit ?? 0,
            })
        } else {
            reset({
                name: "",
                limit: 0,
            })
        }
    }, [props.isEditing, props.selectedRoom, reset])


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            {/* Trigger is outside the form */}
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-500 text-white">
                    <Plus /> Create New Room
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{props.isEditing ? "Edit Room" : "Create Room"} </DialogTitle>
                        <DialogDescription>
                            {/* Empty rooms won't show to other users unless you share it directly */}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            {...register("name")}
                            id="name"
                            placeholder="Room name"
                            defaultValue={props.isEditing ? props.selectedRoom?.name ?? "" : ""}
                        />
                    </div>

                    <Controller
                        name="limit"
                        control={control}
                        render={({ field }) => (
                            <NumberField
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                defaultValue={0}
                                minValue={0}
                                maxValue={10}
                                className='w-full max-w-[50%] space-y-2'>
                                <LabelRAC className='flex items-center gap-2 text-sm leading-none font-medium select-none'>
                                    Room user limit
                                </LabelRAC>
                                <GroupRAC className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
                                    <ButtonRAC
                                        slot='decrement'
                                        className='border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-l-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                        <MinusIcon className='size-4' />
                                        <span className='sr-only'>Decrement</span>
                                    </ButtonRAC>
                                    <InputRAC className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none' />
                                    <ButtonRAC
                                        slot='increment'
                                        className='border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                        <PlusIcon className='size-4' />
                                        <span className='sr-only'>Increment</span>
                                    </ButtonRAC>
                                </GroupRAC>
                                <p className='text-muted-foreground text-xs'>
                                    You can change it later
                                </p>
                            </NumberField>
                        )}
                    />




                    <DialogFooter className="flex justify-between ">
                        <DialogClose asChild>
                            <Button type="button">Cancel</Button>
                        </DialogClose>
                        <Button disabled={isPending} type="submit">{props.isEditing ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    )
}
