import EmojiPicker from "emoji-picker-react";
import { Ban, Send, Smile, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import ScrollToBottom, { useScrollToBottom } from "react-scroll-to-bottom";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
  const [newMessage, setNewMessage] = useState<string>("");
  const scrollToBottom = useScrollToBottom();
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const messageInputBoxRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!openEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setOpenEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openEmojiPicker]);

  const getRoomMessages = async () => {
    if (!props.roomId) return;
    if (!hasLoadedOnceRef.current) setMessagesLoading(true);

    const { data, error } = await supabase
      .from("room_messages")
      .select("*, user:users!room_messages_userId_fkey(*)")
      .eq("roomId", props.roomId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (!error) setMessages(data.reverse());
    scrollToBottom({ behavior: "auto" });

    if (!hasLoadedOnceRef.current) {
      setMessagesLoading(false);
      hasLoadedOnceRef.current = true;
    }
  };

  const addMessage = async (messageContent: string) => {
    const trimmed = messageContent.trim();
    if (!trimmed) return;

    const request: TmessageCreate = {
      content: trimmed,
      roomId: props.roomId,
      userId: props.userId,
      tempId: uuidv4(),
    };

    const messageValidated = messageCreateSchema.safeParse(request);
    if (!messageValidated.success) { console.log(messageValidated.error); return; }

    const localMessage: IMessage = {
      id: request.tempId,
      createdAt: new Date(Date.now()).toUTCString(),
      status: "pending",
      ...request,
      user: props.user,
    };

    setMessages((prev) => [...prev, localMessage]);
    setNewMessage("");

    const { error } = await supabase.from("room_messages").insert([messageValidated.data]);

    if (error) {
      console.log(error);
      setMessages((prev) =>
        prev.map((msg) => msg.id === request.tempId ? { ...msg, status: "failed" } : msg)
      );
    }
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => (prev || "") + emojiObject.emoji);
    setOpenEmojiPicker(false);
    messageInputBoxRef.current?.focus();
  };

  const deleteYourMessageForEveryone = (message: IMessage) => {
    if (message.status !== "sent") return;
    if (!message.id) return;
    if (message.roomId !== props.roomId) return;
    if (message.userId !== props.userId) return;

    setMessageDeletingLoading(async () => {
      setMessages((prev) =>
        prev.map((msg) => msg.id === message.id ? { ...msg, status: "pending" } : msg)
      );
      const { error } = await supabase
        .from("room_messages")
        .update([{ status: "deleted", content: "This message has deleted" }])
        .eq("id", message.id);

      if (error) {
        console.log(error);
        setMessages((prev) =>
          prev.map((msg) => msg.id === message.id ? { ...msg, status: "sent" } : msg)
        );
      }
    });
  };

  useEffect(() => {
    getRoomMessages();
    const roomsChannel = supabase
      .channel("on_room_messages_change")
      .on("postgres_changes", { event: "*", schema: "public", table: "room_messages", filter: `roomId=eq.${props.roomId}` }, getRoomMessages)
      .on("postgres_changes", { event: "*", schema: "public", table: "roomparticipants", filter: `roomid=eq.${props.roomId}` }, getRoomMessages)
      .subscribe();
    return () => { supabase.removeChannel(roomsChannel); };
  }, []);

  const canSend = (newMessage?.trim().length || 0) > 0;

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-gray-950 overflow-hidden",
      isMobile && "bg-gray-950"
    )}>

      {/* Message list */}
      <ScrollToBottom
        followButtonClassName="hidden"
        initialScrollBehavior="auto"
        mode="bottom"
        scrollViewClassName="flex flex-col gap-1 px-3 py-3 no-scrollbar"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {messagesLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {!messagesLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <Send className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-gray-600 text-xs">No messages yet</p>
          </div>
        )}

        {messages.map((item, idx) => {
          const isOwn = item.userId === props.userId;
          const prevMsg = messages[idx - 1];
          const isSameAuthorAsPrev = prevMsg && prevMsg.userId === item.userId;

          return (
            <MessageSingle
              key={item.id}
              message={item}
              owner={isOwn}
              deleteMessage={deleteYourMessageForEveryone}
              messageDeletingLoading={messageDeletingLoading}
              compact={isSameAuthorAsPrev}
            />
          );
        })}
      </ScrollToBottom>

      {/* Emoji picker */}
      {openEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-2 right-2 z-50"
        >
          <EmojiPicker
            open
            onEmojiClick={handleEmojiClick}
            theme={"dark" as any}
            skinTonesDisabled
            searchDisabled={isMobile}
            previewConfig={{ showPreview: false }}
            style={{ width: "100%", border: "1px solid #1f2937", borderRadius: "16px" } as React.CSSProperties}
          />
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-800/50">
        <div className={cn(
          "flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-2xl px-3 py-1.5 transition-all duration-200 focus-within:border-gray-600"
        )}>
          {isDesktop && (
            <button
              type="button"
              onClick={() => setOpenEmojiPicker(p => !p)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors shrink-0",
                openEmojiPicker && "text-gray-300 bg-gray-800"
              )}
            >
              <Smile className="w-4 h-4" />
            </button>
          )}

          <input
            ref={messageInputBoxRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addMessage(newMessage || "");
              }
            }}
            placeholder="Message…"
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 text-sm outline-none min-w-0 py-1.5"
          />

          <button
            type="button"
            onClick={() => addMessage(newMessage || "")}
            disabled={!canSend}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 shrink-0",
              canSend
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "text-gray-600 cursor-default"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

// ─────────────────────────────────────────────────────────────────────────────
// MessageSingle
// ─────────────────────────────────────────────────────────────────────────────

type MessageSingleProps = {
  owner?: boolean;
  message: IMessage;
  messageDeletingLoading: boolean;
  deleteMessage: (message: IMessage) => void;
  compact?: boolean;
};

function MessageSingle({
  messageDeletingLoading,
  deleteMessage,
  message,
  owner = false,
  compact = false,
}: MessageSingleProps) {
  const StatusIcon = MessageStatuses.find((item) => item.key === message.status)?.icon;

  const isDeleted = message.status === "deleted";
  const isFailed  = message.status === "failed";
  const isPending = message.status === "pending";

  return (
    <div className={cn(
      "flex group",
      owner ? "justify-end" : "justify-start",
      compact ? "mt-0.5" : "mt-2"
    )}>
      <div className={cn(
        "relative max-w-[78%]",
      )}>
        {/* Author name — only on first message in a group */}
        {!compact && !owner && (
          <p className="text-gray-500 text-[11px] font-medium mb-1 px-1">
            {message.user?.fullName || "Unknown"}
          </p>
        )}

        <div className={cn(
          "relative px-3 py-2 rounded-2xl text-sm transition-opacity duration-200",
          owner
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-gray-800 text-gray-200 rounded-tl-sm",
          isPending && "opacity-60",
          isFailed  && "bg-red-900/60 border border-red-800/60 text-red-200",
          isDeleted && "bg-transparent border border-gray-800"
        )}>

          {/* Delete dropdown — shown on hover for own messages */}
          {owner && !isDeleted && message.status === "sent" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="absolute -top-1.5 -left-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
                  <Trash2 className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-40 bg-gray-900 border-gray-700" side="left">
                <DropdownMenuItem
                  disabled={messageDeletingLoading}
                  onClick={() => deleteMessage(message)}
                  variant="destructive"
                  className="text-red-400 focus:text-red-300 focus:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete for everyone
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Content */}
          {isDeleted ? (
            <div className="flex items-center gap-1.5 text-gray-600 italic text-xs">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>Message deleted</span>
            </div>
          ) : (
            <span className="break-words leading-relaxed">{message.content}</span>
          )}

          {/* Status icon for own messages */}
          {owner && StatusIcon && !isDeleted && (
            <span className={cn(
              "inline-flex items-center ml-2 opacity-70",
              isFailed && "opacity-100"
            )}>
              <StatusIcon
                className={cn(isFailed ? "text-red-300" : "text-blue-200")}
                size={12}
              />
            </span>
          )}
        </div>

        {/* Failed label */}
        {isFailed && (
          <p className="text-red-500 text-[10px] mt-0.5 px-1 text-right">Failed to send</p>
        )}
      </div>
    </div>
  );
}
