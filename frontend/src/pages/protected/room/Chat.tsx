import EmojiPicker from "emoji-picker-react";
import { Ban, Ellipsis, Send, Trash } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import ScrollToBottom, { useScrollToBottom } from "react-scroll-to-bottom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../components/ui/input-group";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import type { IMessage, IUser } from "../../../interfaces";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { MessageStatuses } from "../../../types";
import { messageCreateSchema, type TmessageCreate } from "./schema";

type ChatProps = {
  roomId: string;
  userId: string;
  user?: IUser;
};

const Chat = ({ ...props }: ChatProps) => {
  const { isMobile, isDesktop } = useBreakpoint();
  const [messages, setMessages] = useState<IMessage[]>([]);

  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const hasLoadedOnceRef = useRef(false);

  const [messageDeletingLoading, setMessageDeletingLoading] = useTransition();

  const [newMessage, setNewMessage] = useState<string>();

  const scrollToBottom = useScrollToBottom();

  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  const messageInputBoxRef = useRef<HTMLInputElement>(null);

  const getRoomMessages = async () => {
    if (!props.roomId) return;

    if (!hasLoadedOnceRef.current) setMessagesLoading(true);

    const { data, error } = await supabase
      .from("room_messages")
      .select("*, user:users!room_messages_userId_fkey(*)")
      .eq("roomId", props.roomId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (!error) setMessages(data.reverse()); // important
    scrollToBottom({ behavior: "auto" });

    if (!hasLoadedOnceRef.current) {
      setMessagesLoading(false);
      hasLoadedOnceRef.current = true;
    }
  };

  const addMessage = async (messageContent: string) => {
    const request: TmessageCreate = {
      content: messageContent,
      roomId: props.roomId,
      userId: props.userId,
      tempId: uuidv4(),
    };

    const messageValidated = messageCreateSchema.safeParse(request);

    if (!messageValidated.success) {
      console.log(messageValidated.error);
      return;
    }

    const localMessage: IMessage = {
      id: request.tempId,
      createdAt: new Date(Date.now()).toUTCString(),
      status: "pending",
      ...request,
      user: props.user,
    };

    setMessages((prev) => [...prev, localMessage]);

    setNewMessage("");

    const { error } = await supabase
      .from("room_messages")
      .insert([messageValidated.data]);

    if (error) {
      console.log(error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === request.tempId ? { ...msg, status: "failed" } : msg
        )
      );

      return;
    }
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => (prev || "") + " " + emojiObject.emoji) + " ";
    setOpenEmojiPicker(false);
    if (messageInputBoxRef.current) {
      messageInputBoxRef.current.focus();
    }
  };

  const deleteYourMessageForEveryone = (message: IMessage) => {
    if (message.status !== "sent") return;
    if (!message.id) return;
    if (message.roomId !== props.roomId) return;
    if (message.userId !== props.userId) return;

    setMessageDeletingLoading(async () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "pending" } : msg
        )
      );

      const { error } = await supabase
        .from("room_messages")
        .update([{ status: "deleted", content: "This message has deleted" }])
        .eq("id", message.id);

      if (error) {
        console.log(error);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, status: "sent" } : msg
          )
        );

        return;
      }
    });
  };

  useEffect(() => {
    getRoomMessages();
    const roomsChannel = supabase
      .channel("on_room_messages_change")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_messages",
          filter: `roomId=eq.${props.roomId}`,
        },

        getRoomMessages
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roomparticipants",
          filter: `roomid=eq.${props.roomId}`,
        },
        getRoomMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative bg-gray-5 w-1/3 px-4 pb-2 pt-2 rounded-xl shrink-0 flex flex-col justify-between min-h-0 overflow-hidden",
        isMobile && "w-full pt-2 h-full flex-1 bg-gray-1 px-1"
      )}
    >
      <ScrollToBottom
        followButtonClassName="scroll-follow-button"
        initialScrollBehavior="auto"
        mode="bottom"
        scrollViewClassName="flex flex-col gap-2 no-scrollbar"
        className="min-h-0 overflow-y-auto"
      >
        {messagesLoading && (
          <div className="text-center text-xs">Loading messages...</div>
        )}
        {messages.length <= 0 && (
          <div className="text-center text-xs text-gray-10">
            No messages found
          </div>
        )}

        {messages.map((item) => (
          <MessageSingle
            key={item.id}
            message={item}
            owner={item.userId === props.userId}
            deleteMessage={deleteYourMessageForEveryone}
            messageDeletingLoading={messageDeletingLoading}
          />
        ))}
      </ScrollToBottom>

      <form>
        <div className="absolute bottom-18 w-full">
          <EmojiPicker open={openEmojiPicker} onEmojiClick={handleEmojiClick} />
        </div>

        <InputGroup className="mt-2 bg-gray-1 py-7 px-1">
          <InputGroupInput
            ref={messageInputBoxRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message"
            className="bg-gray-1 "
          />
          <InputGroupAddon align={"inline-end"}>
            {isDesktop && (
              <Button
                type="button"
                variant={"ghost"}
                onClick={() => {
                  setOpenEmojiPicker((prev) => !prev);
                }}
                className=" text-gray-12  text-xl hover:bg-blue-500"
              >
                😄
              </Button>
            )}

            <Button
              variant={"ghost"}
              onClick={(e) => {
                e.preventDefault();
                addMessage(newMessage || "");
              }}
              className={cn(
                "text-gray-12",
                (newMessage?.length || 0) > 0 && "bg-blue-400"
              )}
            >
              <Send />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
};

export default Chat;

type MessageSingleProps = {
  owner?: boolean;
  message: IMessage;
  messageDeletingLoading: boolean;
  deleteMessage: (message: IMessage) => void;
};

function MessageSingle({
  messageDeletingLoading,
  deleteMessage,
  message,
  owner = false,
}: MessageSingleProps) {
  const StatusIcon = MessageStatuses.find(
    (item) => item.key === message.status
  )?.icon;
  return (
    <div
      className={cn(
        "p-3 rounded-xl w-max relative group",
        owner ? "bg-gray-4 ml-auto text-left" : "bg-gray-4",
        owner && message.status === "failed" && "border border-red-400"
      )}
    >
      {owner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="opacity-0 group-hover:opacity-100 text-gray-12 bg-gray-8 shadow-2xl rounded-md w-5 h-5 absolute top-0 right-0"
            asChild
          >
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-40" side="left">
            <DropdownMenuItem
              disabled={messageDeletingLoading}
              onClick={() => {
                deleteMessage(message);
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <h3 className="font-semibold">{message.user?.fullName || "Unknown"}</h3>
      <div className="flex justify-between items-center gap-2">
        <span>
          {message.status === "deleted" ? (
            <div className="text-gray-10 italic flex gap-1.5 items-center">
              <Ban className="w-4 h-4" />
              <span className="text-gray-10 italic">
                This message has deleted
              </span>
            </div>
          ) : (
            message.content
          )}
        </span>
        {owner && (
          <span>
            {StatusIcon && (
              <StatusIcon
                className={cn(
                  "text-gray-8",
                  owner && message.status === "failed" && " text-red-400"
                )}
                size={16}
              />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
