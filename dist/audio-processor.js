class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0];

      const pcm16 = new Int16Array(channelData.length);

      for (let i = 0; i < channelData.length; i++) {
        const clampedValue = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = Math.floor(clampedValue * 32767);
      }

      this.port.postMessage({
        type: 'audio',
        data: pcm16.buffer
      }, [pcm16.buffer]);
    }

    return true;
  }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);
