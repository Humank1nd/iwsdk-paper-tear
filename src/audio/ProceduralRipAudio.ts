export class ProceduralRipAudio {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;

  private ensureInit() {
    if (this.ctx) return;
    this.ctx = new AudioContext();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() > 0.85 ? (Math.random() * 2 - 1) : (Math.random() * 0.2 - 0.1);
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 2400;
    this.filter.Q.value = 1.4;

    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;

    this.noiseNode.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.ctx.destination);
    this.noiseNode.start();
  }

  updateRip(handSpeed: number, deltaRip: number) {
    this.ensureInit();
    if (!this.ctx || !this.filter || !this.gain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const clampedSpeed = Math.min(Math.max(handSpeed, 0.1), 2.5);

    this.filter.frequency.setTargetAtTime(1800 + clampedSpeed * 1100, now, 0.02);
    const targetGain = Math.min(deltaRip * 18 + clampedSpeed * 0.15, 0.45);
    this.gain.gain.setTargetAtTime(targetGain, now, 0.015);
  }

  silence() {
    if (!this.ctx || !this.gain) return;
    this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
  }

  playFinalSnap() {
    if (!this.ctx || !this.filter || !this.gain) return;
    const now = this.ctx.currentTime;
    this.filter.frequency.setValueAtTime(3600, now);
    this.gain.gain.setValueAtTime(0.5, now);
    this.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  }
}
