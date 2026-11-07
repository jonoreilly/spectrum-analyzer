// This should only run in an Audio Worklet process

class AudioProcessor extends AudioWorkletProcessor {
  /** @param {Float32Array[][]} inputs */
  process(inputs) {
    const samples = inputs[0]?.[0];

    if (samples) {
      // Clone the samples
      const copy = new Float32Array(samples);

      this.port.postMessage(copy);
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
