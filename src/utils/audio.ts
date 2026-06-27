import { Result } from "./utils";

let audioContext: AudioContext | undefined = undefined;

export function getAudioContext() {
  if (!window) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export async function decodeAudioFile(
  file?: File,
): Promise<Result<AudioBuffer, "unsupported-file-type" | "no-audio-context">> {
  // No audio file
  if (!file) {
    return { status: "initial" };
  }
  // No audio context
  const audioContext = getAudioContext();

  if (!audioContext) {
    return { status: "error", error: "no-audio-context" };
  }
  // Decode audio file
  try {
    const arrayBuffer = await file.arrayBuffer();

    const newAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return {
      status: "success",
      value: newAudioBuffer,
    };
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      error: "unsupported-file-type",
    };
  }
}
