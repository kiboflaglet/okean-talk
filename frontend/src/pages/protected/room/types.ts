export type VoiceStatus = "idle" | "waiting" | "connecting" | "connected" | "error";

export type SignalMessage = {
  type: "offer" | "answer" | "ice" | "join" | "leave";
  senderId: string;
  targetId?: string;
  payload?: any;
};