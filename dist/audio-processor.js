class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.silenceThreshold = 0.01;
    this.silenceFrames = 0;
    this.silenceFramesRequired = Math.floor(16000 / 128);
    this.hasVoiceActivity = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0];

      const pcm16 = new Int16Array(channelData.length);
      let sum = 0;

      for (let i = 0; i < channelData.length; i++) {
        const clampedValue = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = Math.floor(clampedValue * 32767);
        sum += Math.abs(channelData[i]);
      }

      const avgAmplitude = sum / channelData.length;

      if (avgAmplitude > this.silenceThreshold) {
        this.hasVoiceActivity = true;
        this.silenceFrames = 0;
      } else if (this.hasVoiceActivity) {
        this.silenceFrames++;

        if (this.silenceFrames >= this.silenceFramesRequired) {
          this.port.postMessage({ type: 'silence_detected' });
          this.hasVoiceActivity = false;
          this.silenceFrames = 0;
        }
      }

      this.port.postMessage({
        type: 'audio',
        data: pcm16.buffer,
        amplitude: avgAmplitude
      }, [pcm16.buffer]);
    }

    return true;
  }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);
