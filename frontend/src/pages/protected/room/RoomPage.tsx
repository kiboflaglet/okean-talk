import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import type { IRoom } from "@/interfaces";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useLoaderData } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { supabase } from "../../../lib/supabaseClient";
import { type RoomLoader } from "../../../types";
import {
  roomParticipantCreateSchema,
  type roomParticipantCreate,
} from "../../home/roomSchema";
import NotJoined from "./NotJoined";
import RoomDesktopVersion from "./DesktopComponents/RoomDesktopVersion";
import RoomMobileVersion from "./MobileComponents/RoomMobileVersion";
import type { SignalMessage } from "./types";
import { v4 as uuidv4 } from "uuid";

const MY_ID = uuidv4();

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
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

  const [micEnabled, setMicEnabled] = useState(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState<
    boolean | null
  >(null);

  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const voiceChannelRef = useRef<RealtimeChannel | null>(null); // unchanged, keep it
  const iceBuffersRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const remoteDescSetRef = useRef<Map<string, boolean>>(new Map());
  const voiceStartedRef = useRef(false);

  const [openUserSettings, setOpenUserSettings] = useState(false);
  const [signOutLoading, setSignOutLoading] = useTransition();

  const logOut = () => {
    setSignOutLoading(async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });
  };

  useBackButtonClose(openUserSettings, () => {
    setOpenUserSettings(false);
  });

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

  const closePeer = useCallback((peerId: string) => {
    pcsRef.current.get(peerId)?.close();
    pcsRef.current.delete(peerId);

    const audio = remoteAudiosRef.current.get(peerId);
    if (audio) audio.srcObject = null;
    remoteAudiosRef.current.delete(peerId);

    iceBuffersRef.current.delete(peerId);
    remoteDescSetRef.current.delete(peerId);
  }, []);

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
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        closePeer(peerId);
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
      return;
    }

    if (raw.type === "leave") {
      closePeer(raw.senderId);
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
          sampleRate: 480002,
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
        });

      voiceChannelRef.current = channel;
    } catch (e) {
      voiceStartedRef.current = false;
      console.warn("Mic unavailable:", e);
      setMicPermissionGranted(false);
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

  const count = roomData?.users?.length || 0;

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

  useEffect(() => () => voiceCleanup(true), []);

  if (!userJoined) {
    return (
      <NotJoined
        roomLoader={roomLoader}
        userInitials={userInitials}
        handleMicToggle={handleMicToggle}
        micEnabled={micEnabled}
        micPermissionGranted={micPermissionGranted}
        joinRoom={joinRoom}
        error={error}
        userJoinLoading={userJoinLoading}
        count={count}
      />
    );
  }

  if (isMobile) {
    return (
      <RoomMobileVersion
        roomLoader={roomLoader}
        userInitials={userInitials}
        logOut={logOut}
        leaveRoom={leaveRoom}
        toggleMute={toggleMute}
        count={count}
        userLeaveLoading={userLeaveLoading}
        isMuted={isMuted}
          micEnabled={micEnabled}
      roomId={roomId}
      roomData={roomData}
      />
    );
  }

  return (
    <RoomDesktopVersion
      roomLoader={roomLoader}
      userInitials={userInitials}
      leaveRoom={leaveRoom}
      toggleMute={toggleMute}
      count={count}
      userLeaveLoading={userLeaveLoading}
      isMuted={isMuted}
      signOutLoading={signOutLoading}
      logOut={logOut}
      micEnabled={micEnabled}
      roomId={roomId}
      roomData={roomData}
    />
  );
};

export default RoomPage;
