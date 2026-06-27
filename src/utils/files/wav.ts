export async function readWav(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  console.log(audioBuffer.sampleRate);
  console.log(audioBuffer.numberOfChannels);
  console.log(audioBuffer.duration);

  // Get samples for the first channel
  const samples = audioBuffer.getChannelData(0);
}
