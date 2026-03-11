import type { IRoom, IUser } from "@/src/interfaces";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Copy,
  Loader,
  MessageSquareText,
  Mic,
  MicOff,
  Phone,
  Radio,
  SettingsIcon,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useLoaderData } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Languages, type RoomLoader } from "../../../types";
import {
  roomParticipantCreateSchema,
  type roomParticipantCreate,
} from "../../home/roomSchema";
import Chat from "./Chat";
import type { SignalMessage, VoiceStatus } from "./types";

const MY_ID = Math.random().toString(36).slice(2, 10);

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const RoomPage = () => {
  const { isMobile } = useBreakpoint();
  const roomLoader: RoomLoader = useLoaderData();
  const [roomId] = useState<string | null>(roomLoader?.roomData?.id || null);
  const [roomData, setRoomData] = useState(roomLoader?.roomData);
  const [error, setError] = useState<string | null>(null);
  const [userJoined, setUserJoined] = useState(false);
  const [userJoinLoading, setUserJoinLoading] = useState(false);
  const [userLeaveLoading, setUserLeaveLoading] = useTransition();
  const [openChatSheet, setOpenChatSheet] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState<
    boolean | null
  >(null);

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  // const [speakingPeerId, setSpeakingPeerId] = useState<string | null>(null); // future: visual indicator

  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const voiceChannelRef = useRef<RealtimeChannel | null>(null); // unchanged, keep it
  const iceBuffersRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const remoteDescSetRef = useRef<Map<string, boolean>>(new Map());
  const voiceStartedRef = useRef(false);
  const userInitials = useMemo(() => {
    if (!roomLoader?.userData) return "";
    return roomLoader.userData.fullName
      .split(" ")
      .map((w: string) => w[0])
      .join("");
  }, []);

  const fetchRoom = async (): Promise<IRoom | undefined> => {
    if (!roomId) return;
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `*, users:roomparticipants (participant:users!roomparticipants_participantid_fkey(*))`
      )
      .eq("id", roomId)
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setRoomData(data);
    return data;
  };

  const joinRoom = async () => {
    if (userJoinLoading || !roomId || !roomLoader.userData) return;
    setUserJoinLoading(true);
    try {
      const validated = roomParticipantCreateSchema.safeParse({
        participantid: roomLoader.userData.id,
        roomid: roomId,
      } satisfies roomParticipantCreate);
      if (!validated.success) {
        setError("Cannot join the room!");
        return;
      }

      const currentData = await fetchRoom();

      const alreadyJoined = currentData?.users?.find(
        (item) => item.participant.id === roomLoader.userData?.id
      );

      if (alreadyJoined) {
        await supabase
          .from("roomparticipants")
          .delete()
          .eq("participantid", roomLoader.userData.id)
          .eq("roomid", roomId);
      }

      const fresh = await fetchRoom();
      if (!fresh) return;
      if ((fresh?.users?.length || 0) >= (fresh?.maxParticipants || 0)) {
        setError("This room is full");
        return;
      }

      const { error } = await supabase
        .from("roomparticipants")
        .insert([validated.data])
        .single();
      if (error) {
        console.error(error);
        return;
      }

      await fetchRoom();

      setUserJoined(true);
    } finally {
      setUserJoinLoading(false);
    }
  };

  const leaveRoom = (id: string | null) => {
    if (!id) return;
    voiceCleanup(true);
    setUserLeaveLoading(async () => {
      await supabase
        .from("roomparticipants")
        .delete()
        .eq("participantid", roomLoader.userData?.id)
        .eq("roomid", id);
      setUserJoined(false);
    });
  };

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        fetchRoom
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roomparticipants",
          filter: `roomid=eq.${roomId}`,
        },
        fetchRoom
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (!userJoined) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [userJoined]);


  useEffect(() => {
    if (userJoined && micEnabled && roomId) {
      startVoice(roomId);
    }
    if (!userJoined) {
      voiceCleanup(false);
    }
  }, [userJoined]);

  const closePeer = useCallback((peerId: string) => {
    pcsRef.current.get(peerId)?.close();
    pcsRef.current.delete(peerId);

    const audio = remoteAudiosRef.current.get(peerId);
    if (audio) audio.srcObject = null;
    remoteAudiosRef.current.delete(peerId);

    iceBuffersRef.current.delete(peerId);
    remoteDescSetRef.current.delete(peerId);
  }, []);

  useEffect(() => () => voiceCleanup(true), []);

  const voiceCleanup = useCallback(
    (notify: boolean) => {
      if (notify && voiceChannelRef.current) {
        voiceChannelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "leave", senderId: MY_ID } satisfies SignalMessage,
        });
      }
      for (const peerId of [...pcsRef.current.keys()]) closePeer(peerId);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (voiceChannelRef.current)
        supabase.removeChannel(voiceChannelRef.current);
      localStreamRef.current = null;
      voiceChannelRef.current = null;
      voiceStartedRef.current = false; 
      setIsMuted(false);
      setVoiceStatus("idle");
    },
    [closePeer]
  );
  function createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    iceBuffersRef.current.set(peerId, []);
    remoteDescSetRef.current.set(peerId, false);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendVoiceSignal({
          type: "ice",
          senderId: MY_ID,
          targetId: peerId, 
          payload: e.candidate.toJSON(),
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") pc.restartIce();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setVoiceStatus("connected");
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        closePeer(peerId);
        if (pcsRef.current.size === 0) setVoiceStatus("waiting");
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;

      if (localStreamRef.current && stream.id === localStreamRef.current.id)
        return;

      let audio = remoteAudiosRef.current.get(peerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        remoteAudiosRef.current.set(peerId, audio);
      }
      if (audio.srcObject !== stream) {
        audio.srcObject = stream;
      }
    };
    pcsRef.current.set(peerId, pc);
    return pc;
  }

  function sendVoiceSignal(msg: SignalMessage) {
    voiceChannelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: msg,
    });
  }

  async function drainIceCandidates(peerId: string, pc: RTCPeerConnection) {
    remoteDescSetRef.current.set(peerId, true);
    const buffer = iceBuffersRef.current.get(peerId) ?? [];
    for (const candidate of buffer) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn("ICE drain:", e);
      }
    }
    iceBuffersRef.current.set(peerId, []);
  }

  async function handleVoiceSignal(raw: SignalMessage) {
    if (raw.senderId === MY_ID) return;
    if (raw.type === "join") {
      if (!localStreamRef.current) return;
      const pc = createPeerConnection(raw.senderId);
      localStreamRef.current
        .getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current!));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendVoiceSignal({
        type: "offer",
        senderId: MY_ID,
        targetId: raw.senderId,
        payload: offer,
      });
      setVoiceStatus("connecting");
      return;
    }

    if (raw.type === "leave") {
      closePeer(raw.senderId);
      if (pcsRef.current.size === 0) setVoiceStatus("waiting");
      return;
    }

    if (raw.targetId && raw.targetId !== MY_ID) return;

    if (raw.type === "offer") {
      let pc = pcsRef.current.get(raw.senderId);
      if (!pc) {
        pc = createPeerConnection(raw.senderId);
        localStreamRef.current
          ?.getTracks()
          .forEach((t) => pc!.addTrack(t, localStreamRef.current!));
      }
      if (pc.signalingState !== "stable") {
        console.warn(`Offer in state "${pc.signalingState}" — ignoring`);
        return;
      }
      await pc.setRemoteDescription(raw.payload as RTCSessionDescriptionInit);
      await drainIceCandidates(raw.senderId, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendVoiceSignal({
        type: "answer",
        senderId: MY_ID,
        targetId: raw.senderId,
        payload: answer,
      });
      setVoiceStatus("connecting");
      return;
    }

    if (raw.type === "answer") {
      const pc = pcsRef.current.get(raw.senderId);
      if (!pc) return;
      if (pc.signalingState !== "have-local-offer") {
        console.warn(`Answer in state "${pc.signalingState}" — ignoring`);
        return;
      }
      await pc.setRemoteDescription(raw.payload as RTCSessionDescriptionInit);
      await drainIceCandidates(raw.senderId, pc);
      return;
    }

    if (raw.type === "ice") {
      const candidate = raw.payload as RTCIceCandidateInit;
      const pc = pcsRef.current.get(raw.senderId);

      if (!pc || !remoteDescSetRef.current.get(raw.senderId)) {
        const buf = iceBuffersRef.current.get(raw.senderId) ?? [];
        buf.push(candidate);
        iceBuffersRef.current.set(raw.senderId, buf);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("addIceCandidate:", e);
      }
    }
  }

  async function startVoice(roomId: string) {
    if (voiceStartedRef.current) return; 
    voiceStartedRef.current = true; 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 480002
        },
      });
      localStreamRef.current = stream;
      setMicPermissionGranted(true);

      const channel = supabase.channel(`voice:${roomId}`, {
        config: { broadcast: { ack: false, self: false } },
      });

      channel
        .on(
          "broadcast",
          { event: "signal" },
          async ({ payload }: { payload: SignalMessage }) => {
            try {
              await handleVoiceSignal(payload);
            } catch (e) {
              console.error("Signal error:", e);
            }
          }
        )
        .subscribe((s) => {
          if (s !== "SUBSCRIBED") return;
          sendVoiceSignal({ type: "join", senderId: MY_ID });
          setVoiceStatus("waiting");
        });

      voiceChannelRef.current = channel;
    } catch (e) {
      voiceStartedRef.current = false; 
      console.warn("Mic unavailable:", e);
      setMicPermissionGranted(false);
      setVoiceStatus("idle");
    }
  }

  function toggleMute() {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }

  async function handleMicToggle() {
    if (!micEnabled) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop()); 
        setMicPermissionGranted(true);
        setMicEnabled(true);
      } catch {
        setMicPermissionGranted(false);
        setMicEnabled(false);
      }
    } else {
      setMicEnabled(false);
    }
  }

  const voiceBadge = {
    idle: { label: "Voice off", color: "bg-gray-700 text-gray-400" },
    waiting: { label: "Waiting…", color: "bg-yellow-900/60 text-yellow-400" },
    connecting: { label: "Connecting…", color: "bg-blue-900/60 text-blue-400" },
    connected: { label: "Live", color: "bg-emerald-900/60 text-emerald-400" },
    error: { label: "Voice error", color: "bg-red-900/60 text-red-400" },
  }[voiceStatus];

  const count = roomData?.users?.length || 0;

  if (!userJoined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              You're about to join
            </p>
            <h1 className="text-white text-xl font-semibold leading-snug line-clamp-2">
              {roomLoader.roomData?.topic}
            </h1>
          </div>

          <div className="relative">
            <div className="w-24 h-24 rounded-full ring-2 ring-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
              <Avatar className="size-24">
                <AvatarImage
                  alt={roomLoader.userData?.fullName}
                  src={roomLoader.userData?.avatar_url}
                />
                <AvatarFallback className="text-2xl bg-gray-800 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <p className="text-gray-300 text-base font-medium">
            {roomLoader.userData?.fullName}
          </p>

          <button
            type="button"
            onClick={handleMicToggle}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
              micEnabled
                ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-300"
                : "border-gray-700 bg-gray-900 text-gray-400"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                micEnabled ? "bg-emerald-800/60" : "bg-gray-800"
              )}
            >
              {micEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {micEnabled ? "Microphone on" : "Microphone off"}
              </p>
              <p className="text-xs opacity-60 mt-0.5">
                {micEnabled
                  ? "Others will hear you"
                  : "You'll join muted — tap to enable"}
              </p>
            </div>
            <div
              className={cn(
                "ml-auto w-5 h-5 rounded-full border-2 transition-colors shrink-0",
                micEnabled
                  ? "bg-emerald-400 border-emerald-400"
                  : "border-gray-600"
              )}
            />
          </button>

          {micPermissionGranted === false && (
            <p className="text-xs text-red-400 text-center -mt-2">
              Microphone access was denied. Check your browser settings.
            </p>
          )}

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <Button
            onClick={joinRoom}
            disabled={userJoinLoading}
            className="w-full h-12 rounded-2xl bg-white text-black hover:bg-gray-100 font-semibold text-sm transition-all"
          >
            {userJoinLoading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" /> Joining…
              </>
            ) : (
              "Join Room"
            )}
          </Button>

          <p className="text-xs text-gray-600">
            {count > 0
              ? `${count} ${count === 1 ? "person" : "people"} already inside`
              : "Be the first to join"}
          </p>
        </div>
      </div>
    );
  }


  if (isMobile) {
    return (
      <div className="relative flex flex-col h-screen bg-gray-950 overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium",
                voiceBadge.color
              )}
            >
              <Radio className="w-3 h-3" />
              {voiceBadge.label}
            </span>
          </div>

          <Avatar className="size-8 ring-1 ring-gray-700">
            <AvatarImage
              alt={roomLoader?.userData?.fullName}
              src={roomLoader?.userData?.avatar_url}
            />
            <AvatarFallback className="text-xs bg-gray-800 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="px-4 mb-4">
          <p className="text-gray-300 text-sm font-medium line-clamp-2">
            {roomLoader.roomData?.topic}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {roomData?.languages?.map((item, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 text-gray-400 rounded-md px-2 py-0.5"
              >
                {Languages.find((l) => l.value === item)?.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-3">
            {roomData?.users?.map((item, i) => (
              <div
                key={item.participant.id}
                className={cn(
                  "bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 py-6 transition-all",
                  count % 2 === 1 && i === count - 1
                    ? "col-span-2 max-w-[50%] mx-auto w-full"
                    : "",
                  voiceStatus === "connected" && "border-emerald-800/40"
                )}
              >
                <UserCard
                  participant={item.participant}
                  voiceConnected={voiceStatus === "connected"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-8 pt-4 flex items-center justify-between gap-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="destructive"
                className="rounded-full w-12 h-12 p-0 bg-red-900/80 hover:bg-red-800 border border-red-800/50"
                disabled={userLeaveLoading}
              >
                {userLeaveLoading ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-gray-950 border-gray-800">
              <DrawerHeader>
                <DrawerTitle className="text-white">
                  Leave this room?
                </DrawerTitle>
              </DrawerHeader>
              <DrawerFooter>
                <Button
                  onClick={() => leaveRoom(roomId)}
                  disabled={userLeaveLoading}
                  variant="destructive"
                >
                  {userLeaveLoading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                      Leaving
                    </>
                  ) : (
                    "Leave Room"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Button
            onClick={toggleMute}
            disabled={
              voiceStatus === "idle" || voiceStatus === "error" || !micEnabled
            }
            className={cn(
              "rounded-full w-12 h-12 p-0 border transition-all",
              isMuted
                ? "bg-red-900/60 border-red-800/50 hover:bg-red-800/60"
                : "bg-gray-800 border-gray-700 hover:bg-gray-700"
            )}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-red-300" />
            ) : (
              <Mic className="w-5 h-5 text-gray-200" />
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{count}</span>
          </div>

          <Sheet open={openChatSheet} onOpenChange={setOpenChatSheet}>
            <SheetTrigger asChild>
              <Button className="rounded-full w-12 h-12 p-0 bg-gray-800 border border-gray-700 hover:bg-gray-700">
                <MessageSquareText className="w-5 h-5 text-gray-200" />
              </Button>
            </SheetTrigger>
            <SheetContent
              showCloseButton={false}
              className="min-w-screen bg-gray-950 border-gray-800 p-0"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-gray-800">
                  <Button
                    variant="ghost"
                    className="size-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                    onClick={() => setOpenChatSheet(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <p className="text-white font-medium text-sm flex-1">
                    Chat · {count} {count === 1 ? "person" : "people"}
                  </p>
                  <Avatar className="size-7">
                    <AvatarImage
                      alt={roomLoader?.userData?.fullName}
                      src={roomLoader?.userData?.avatar_url}
                    />
                    <AvatarFallback className="text-xs bg-gray-800 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-h-0">
                  <Chat
                    user={roomLoader.userData}
                    roomId={roomId || ""}
                    userId={roomLoader.userData?.id || ""}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-800/60 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-white text-sm font-medium truncate max-w-xs">
            {roomData?.topic}
          </h1>
          <div className="flex gap-1.5 shrink-0">
            {roomData?.languages?.map((item, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 text-gray-400 rounded px-2 py-0.5"
              >
                {Languages.find((l) => l.value === item)?.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium",
              voiceBadge.color
            )}
          >
            <Radio className="w-3 h-3" />
            {voiceBadge.label}
          </span>

          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800 size-9 p-0 rounded-full"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-8 cursor-pointer ring-1 ring-gray-700 hover:ring-gray-500 transition-all">
                <AvatarImage
                  alt={roomLoader?.userData?.fullName}
                  src={roomLoader.userData?.avatar_url}
                />
                <AvatarFallback className="text-xs bg-gray-800 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-40 bg-gray-900 border-gray-700"
              side="bottom"
              align="end"
            >
              <div className="px-3 py-2">
                <p className="text-white text-sm font-medium">
                  {roomLoader.userData?.fullName}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">ID: {MY_ID}</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-gray-300 hover:text-white focus:bg-gray-800">
                <SettingsIcon className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col p-6 min-w-0">
          <div className="flex-1 flex items-center justify-center">
            <div
              className={cn(
                "grid gap-4 w-full",
                count <= 1
                  ? "grid-cols-1 max-w-xs"
                  : count <= 2
                  ? "grid-cols-2 max-w-lg"
                  : count <= 4
                  ? "grid-cols-2 max-w-2xl"
                  : "grid-cols-3 max-w-3xl"
              )}
            >
              {roomData?.users?.map((item) => (
                <div
                  key={item.participant.id}
                  className={cn(
                    "bg-gray-900 border border-gray-800 rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 transition-all duration-300",
                    voiceStatus === "connected" &&
                      "border-emerald-800/30 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]"
                  )}
                >
                  <UserCard
                    participant={item.participant}
                    voiceConnected={voiceStatus === "connected"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-between pt-4 border-t border-gray-800/50">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  disabled={userLeaveLoading}
                  className="bg-red-900/70 hover:bg-red-800/80 text-red-200 border border-red-800/50 rounded-xl px-4 h-9 text-sm"
                >
                  {userLeaveLoading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 mr-1.5" />
                      Leaving
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-1.5" />
                      Leave
                    </>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-gray-950 border-gray-800">
                <DrawerHeader>
                  <DrawerTitle className="text-white">
                    Leave this room?
                  </DrawerTitle>
                </DrawerHeader>
                <DrawerFooter>
                  <Button
                    onClick={() => leaveRoom(roomId)}
                    disabled={userLeaveLoading}
                    variant="destructive"
                  >
                    {userLeaveLoading ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                        Leaving
                      </>
                    ) : (
                      "Leave Room"
                    )}
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                disabled={
                  voiceStatus === "idle" ||
                  voiceStatus === "error" ||
                  !micEnabled
                }
                className={cn(
                  "rounded-full w-11 h-11 p-0 border transition-all",
                  isMuted
                    ? "bg-red-900/60 border-red-800/50 hover:bg-red-800/60"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                )}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4 text-red-300" />
                ) : (
                  <Mic className="w-4 h-4 text-gray-200" />
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-300 text-xs font-mono flex items-center gap-2 hover:bg-gray-800 rounded-xl px-3 h-9"
              onClick={() => navigator.clipboard.writeText(roomId || "")}
            >
              {roomId?.slice(0, 12)}… <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col shrink-0  border-l border-gray-800/60">
          <div className="px-4 py-3 border-b border-gray-800/60 flex items-center gap-2 shrink-0">
            <MessageSquareText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm">Chat</span>
            <span className="ml-auto text-gray-600 text-xs">
              {count} {count === 1 ? "person" : "people"}
            </span>
          </div>
          <Chat
            user={roomLoader.userData}
            roomId={roomId || ""}
            userId={roomLoader.userData?.id || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;


type UserCardProps = {
  participant: IUser;
  voiceConnected?: boolean;
};

function UserCard({ participant, voiceConnected }: UserCardProps) {
  const initials = useMemo(
    () =>
      participant?.fullName
        ?.split(" ")
        .map((w: string) => w[0])
        .join("") || "?",
    [participant]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "relative w-16 h-16 rounded-full ring-2 transition-all duration-500",
          voiceConnected ? "ring-emerald-700/50" : "ring-gray-700/50"
        )}
      >
        <Avatar className="size-16">
          <AvatarImage
            alt={participant?.fullName}
            src={(participant as any)?.avatar_url}
          />
          <AvatarFallback className="text-lg font-semibold bg-gray-800 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {voiceConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900" />
        )}
      </div>
      <p className="text-gray-300 text-xs font-medium text-center leading-tight max-w-[80px] truncate">
        {participant?.fullName}
      </p>
    </div>
  );
}
