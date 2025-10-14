"use client";
import { useAppContext } from "@/app/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageService } from "@/lib/services/message.service";
import { RoomUserService } from "@/lib/services/room_user.service";
import { supabase } from "@/lib/supabaseClient";
import { Message, Room, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { message, MessageInput } from "@/lib/validations";
import { Mic, MicOff, Phone, Settings } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';


interface props {
    room: Room
}
const messageService = new MessageService()
const roomUserService = new RoomUserService()
export default function View({ room }: props) {

    const {
        user,
        refreshUser
    } = useAppContext()

    const { id, name, room_users } = room
    const [isMessagesPending, startMessagesPending] = useTransition()
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [messageError, setMessageError] = useState<string | null>(null);


    const getAllMessages = useCallback(async () => {
        startMessagesPending(async () => {
            try {
                const res = await messageService.getAllByRoom(id);
                if (res.success) {
                    setMessages(res.data ?? []);
                } else {
                    setMessageError(res.error || "")
                    toast("Error occured", {
                        description: `${res.error}`,
                    });
                }
            } catch (err: any) {
                setMessageError("Database error")
                toast("Error occured", {
                    description: `${err.message || err}`,
                });
            }
        });
    }, []);


    const sendMessage = async () => {

        if (!user) return
        if (!input.trim()) return;
        try {
            const request_data: MessageInput = {
                content: input,
                user_id: user?.id,
                room_id: id
            }

            const validated_request_data = message.parse(request_data)
            const res = await messageService.create(validated_request_data);
            if (!res.success) {
                toast.warning(res.error, {
                    style: {
                        '--normal-bg': 'var(--background)',
                        '--normal-text': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
                        '--normal-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))'
                    } as React.CSSProperties
                })
            }
        } catch (err) {
            toast("Error occured", {
                description: `${err}`,
            })
        }
        setInput("");
    }

    const [userCache, setUserCache] = useState<Map<string, User>>(new Map());

    const joinRoom = async () => {

        console.log({ user })

        if (user?.id === undefined) return

        const res = await roomUserService.create({
            room_id: id,
            user_id: user?.id,
        })

        if (res.success) {
            console.log('room user created')
        } else {
            toast.error("Error occured", {
                description: res.error
            })
        }
    }

    const leaveRoom = () => {
        const handleUnload = () => {
            if (user?.id === undefined) return;
            navigator.sendBeacon("/api/room/leave-room", JSON.stringify({ user_id: user.id, room_id: id }))
        }

        window.addEventListener("unload", handleUnload)

        return () => {
            window.removeEventListener("unload", handleUnload)
        }
    }

    // on initial run
    useEffect(() => {
        getAllMessages();
        joinRoom()

        // live messages
        const subscription = supabase
            .channel(`room-${id}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${id}` },
                async (payload) => {
                    let userData = userCache.get(payload.new.user_id);

                    // If not cached, fetch and cache
                    if (!userData) {
                        const { data } = await supabase
                            .from("users")
                            .select("id, name, auth_id, picture, email, created_at")
                            .eq("id", payload.new.user_id)
                            .single();

                        if (data) {
                            userData = data;
                            setUserCache((prev) => new Map(prev).set(payload.new.user_id, data));
                        }
                    }

                    const newMessage: Message = {
                        id: payload.new.id,
                        content: payload.new.content,
                        room_id: payload.new.room_id,
                        user_id: payload.new.user_id,
                        created_at: payload.new.created_at,
                        users: userData || undefined,
                    };

                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [id, userCache]);

    // on closing browser
    // useEffect(() => {
    //     leaveRoom();
    // }, [user?.id, id])


    return (
        <div className="flex  h-screen w-full mx-auto p-6">



            <div className="flex-[2] flex flex-col border border-r-0 border-default rounded-l-lg overflow-hidden">
                <div className="text-center mt-2">
                    <h1>{name}</h1>
                </div>


                {/* Users Centered & Wrapped */}
                <div className="flex-1 flex flex-wrap  items-center justify-center gap-8 overflow-auto">
                    {room_users?.map((item, i) => (
                        <Avatar key={i} className="w-24 h-24">
                            <AvatarImage
                                src={item.users?.picture || ""}
                                alt="User Avatar"
                            />
                            <AvatarFallback className="text-2xl">
                                {item.users?.name
                                    ?.split(" ")
                                    .map((part: string) => part[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>


                {/* Toolbar */}
                <div className=" border-t py-2  flex gap-10 items-center ">
                    <Toolbar />
                </div>
            </div>


            <Chat
                messages={messages}
                user={user}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}

            />
        </div>


    );
}


function Toolbar() {
    const [micOn, setMicOn] = useState(true)

    return (
        <TooltipProvider>
            <div className="flex justify-around items-center gap-4">
                {/* Phone */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="text-destructive hover:!text-white hover:!bg-red-700 " variant="ghost" size="icon">
                            <Phone />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Leave Call</TooltipContent>
                </Tooltip>

                {/* Settings */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                </Tooltip>

                {/* Mic (toggle) */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMicOn(p => !p)}
                            className={cn(
                                "transition-colors",
                                micOn
                                    ? "!bg-blue-500 !text-white hover:!bg-blue-600" // FORCE active + hover
                                    : "hover:bg-blue-100"                            // normal hover when off
                            )}
                        >
                            {micOn ? <Mic /> : <MicOff />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{micOn ? "Disable Microphone" : "Enable Microphone"}</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}

type ChatProps = {
    messages: Message[];
    user: User | null;
    input: string;
    setInput: (val: string) => void;
    sendMessage: () => void;
};

function Chat({ messages, user, input, setInput, sendMessage }: ChatProps) {
    return (
        <div className="flex-1 flex flex-col border border-default rounded-r-lg overflow-hidden shadow-sm">
            {/* Messages */}
            <StickToBottom
                className="flex-1 relative overflow-y-auto"
                resize="smooth"
                initial="smooth"
            >
                <StickToBottom.Content className="flex flex-col gap-3 p-4">
                    {messages.length === 0 ? (
                        <p className="text-gray-400 text-center italic">No messages yet...</p>
                    ) : (
                        messages.map((item, i) => {
                            const isCurrentUser = item.users?.auth_id === user?.auth_id;

                            // check previous message's user_id
                            const prev = messages[i - 1];
                            const showName = !prev || prev.user_id !== item.user_id;


                            return (
                                <div key={item.id}>
                                    <div
                                        className={`
                                            max-w-[70%] px-4 py-2 rounded-2xl shadow-sm
                                            ${isCurrentUser
                                                ? "ml-auto bg-blue-500 text-white"
                                                : "mr-auto border"
                                            }
                                        `}
                                    >
                                        {showName && (
                                            <span className="font-semibold text-sm mb-1 block">
                                                {isCurrentUser ? "You" : item.users?.name}
                                            </span>
                                        )}
                                        <p className="text-sm">{item.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </StickToBottom.Content>

                {/* Floating "scroll to bottom" button */}
                <ScrollToBottom />
            </StickToBottom>

            {/* Input Box */}
            <div className="px-4 py-2 border-t flex items-center gap-3">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    placeholder="Type a message..."
                />
                <Button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition"
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

function ScrollToBottom() {
    const { isAtBottom, scrollToBottom } = useStickToBottomContext();

    return (
        !isAtBottom && (
            <button
                type="button"
                className="absolute i-ph-arrow-circle-down-fill text-4xl rounded-lg left-1/2 -translate-x-1/2 bottom-2 bg-white shadow-md"
                onClick={() => scrollToBottom()}
            />
        )
    );
}
