import { SPEECH_BASE } from './api';
import type { ISpeechResult } from '../types/api';

export async function evaluateSpeech(wavBlob: Blob, text: string, language: string): Promise<ISpeechResult> {
  const formData = new FormData();
  formData.append('file', wavBlob, 'audio.wav');
  formData.append('text', text);
  formData.append('language', language);

  const response = await fetch(`${SPEECH_BASE}/evaluate`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Evaluation failed');
  return data;
}

export async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  audioCtx.close();

  const numSamples = decoded.length;
  const numChannels = decoded.numberOfChannels;
  const mono = new Float32Array(numSamples);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = decoded.getChannelData(ch);
    for (let i = 0; i < numSamples; i++) mono[i] += channelData[i];
  }
  for (let i = 0; i < numSamples; i++) mono[i] /= numChannels;

  const wavBuffer = encodeWav(mono, 16000);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return buffer;
}
