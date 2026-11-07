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

let microphoneStream: MediaStream | undefined = undefined;

export async function getMicrophoneStream() {
  const audioContext = getAudioContext();

  if (!audioContext || !navigator) {
    return;
  }

  if (!microphoneStream) {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
  }

  return microphoneStream;
}

let isMicrophoneBufferListenerSetUp = false;

let microfoneBufferListeners: ((data: Float32Array) => void)[] = [];

async function setUpMicrophoneBufferListener() {
  if (isMicrophoneBufferListenerSetUp) {
    return;
  }

  const audioContext = getAudioContext();

  const microphoneStream = await getMicrophoneStream();

  if (!audioContext || !microphoneStream) {
    return;
  }

  await audioContext.audioWorklet.addModule("/audioWorkletProcessor.js");

  const source = audioContext.createMediaStreamSource(microphoneStream);

  const processor = new AudioWorkletNode(audioContext, "audio-processor");

  processor.port.onmessage = (event) => {
    console.log(
      "Listeners: ",
      microfoneBufferListeners.length,
      " - ",
      new Date().toISOString(),
    );

    setTimeout(
      () =>
        microfoneBufferListeners.forEach((listener) => listener(event.data)),
      0,
    );
  };

  source.connect(processor);

  // Keep the graph alive without playing microphone back
  const gain = audioContext.createGain();
  gain.gain.value = 0;

  processor.connect(gain);
  gain.connect(audioContext.destination);

  isMicrophoneBufferListenerSetUp = true;
}

export async function setMicrophoneListener(
  listener: (data: Float32Array) => void,
) {
  await setUpMicrophoneBufferListener();

  if (!isMicrophoneBufferListenerSetUp) {
    return "error" as const;
  }

  microfoneBufferListeners = [listener];

  return "success" as const;
}
