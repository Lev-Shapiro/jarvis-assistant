import os from "os";
import path from "path";
import { AIVoice } from "./types/ai-voice";

export const JARVIS_STORAGE_PATH = path.join(os.tmpdir(), "jarvis", "storage");
export const JARVIS_AUDIO_PATH = path.join(JARVIS_STORAGE_PATH, "audio");
export const JARVIS_CAMERA_PATH = path.join(JARVIS_STORAGE_PATH, "camera");

export const JARVIS_VOICE: AIVoice = AIVoice.JARVIS;
export const DEFAULT_PREMIUM_QUALITY: boolean = false;