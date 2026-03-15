import { supabase } from "@/lib/supabaseClient";
import type { SignalMessage } from "@/pages/protected/room/types";
import { useRoomStore } from "@/stores/useRoomStore";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

const MY_ID = uuidv4();


export const useVoiceRoom = () => {
  const isMuted = useRoomStore((s) => s.isMuted);
  const micEnabled = useRoomStore((s) => s.micEnabled);
  const [micPermissionGranted, setMicPermissionGranted] = useState<
    boolean | null
  >(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const voiceChannelRef = useRef<RealtimeChannel | null>(null); // unchanged, keep it
  const iceBuffersRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const remoteDescSetRef = useRef<Map<string, boolean>>(new Map());
  const voiceStartedRef = useRef(false);

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
      useRoomStore.getState().setIsMuted(false);
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

  function handleMute() {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    useRoomStore.getState().setIsMuted(!isMuted);
  }

  async function handleMicToggle() {
    if (!micEnabled) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
        setMicPermissionGranted(true);
        useRoomStore.getState().setMicEnabled(true);
      } catch {
        setMicPermissionGranted(false);
        useRoomStore.getState().setMicEnabled(false);
      }
    } else {
      useRoomStore.getState().setMicEnabled(false);
    }
  }


 

  return { micPermissionGranted, voiceCleanup, startVoice, handleMute, handleMicToggle };
};
