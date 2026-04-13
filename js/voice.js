/* voice.js — Billy Live Interaction Engine
 * Features: STT, TTS (Warm Male Voice), Dynamic Pulse Ring UI
 */

import { state, toast } from './core.js';

export const BillyLive = {
  recognition: null,
  synth: window.speechSynthesis,
  isListening: false,
  isSpeaking: false,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = state.voiceLang || 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      document.body.classList.add('v-listening');
      this.updateStatus('Listening...');
    };

    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      const el = document.getElementById('voice-transcript');
      if (el) el.textContent = transcript || 'Speak your orders, Boss.';

      if (e.results[0].isFinal) {
        this.processCommand(transcript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      document.body.classList.remove('v-listening');
      if (state.isRecording && !this.isSpeaking) {
        try { this.recognition.start(); } catch(e) {}
      }
    };

    this.recognition.onerror = (e) => {
      if (e.error === 'no-speech') return;
      this.updateStatus('Signal weak...');
    };
  },

  open() {
    if (!this.recognition) this.init();
    const modal = document.getElementById('voice-modal');
    if (modal) modal.classList.add('open');
    state.isRecording = true;
    
    // Initial Greeting
    this.speak("Locked and loaded. I'm listening, Boss.");
  },

  close() {
    const modal = document.getElementById('voice-modal');
    if (modal) modal.classList.remove('open');
    state.isRecording = false;
    if (this.recognition) {
       this.recognition.onend = null; 
       this.recognition.stop(); 
    }
    if (this.synth) this.synth.cancel();
    document.body.classList.remove('v-listening', 'v-speaking');
  },

  updateStatus(txt) {
    const el = document.getElementById('voice-status');
    if (el) el.textContent = txt;
  },

  async processCommand(text) {
    if (!text.trim() || text.length < 2) return;
    this.updateStatus('Billy Thinking...');
    
    const input = document.getElementById('inp');
    if (input && window.send) {
       input.value = text;
       await window.send();
    }
  },

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel();
    
    // Clean text for speech (remove markdown)
    const clean = text.replace(/[\*\#\_\[\]\(\)]/g, '').replace(/\[EXPORT:\w+\]/g, '').trim();
    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);
    const voices = this.synth.getVoices();
    // Prefer warm male voice
    const v = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel')) || voices[0];
    if (v) utter.voice = v;
    
    utter.rate = 1.05;
    utter.pitch = 0.95;
    
    utter.onstart = () => {
      this.isSpeaking = true;
      document.body.classList.add('v-speaking');
      this.updateStatus('Billy Speaking...');
      const replyEl = document.getElementById('voice-billy-reply');
      if (replyEl) replyEl.textContent = clean.slice(0, 120) + (clean.length > 120 ? '...' : '');
    };

    utter.onend = () => {
      this.isSpeaking = false;
      document.body.classList.remove('v-speaking');
      if (state.isRecording) {
        this.updateStatus('Listening...');
        try { this.recognition.start(); } catch(e) {}
      }
    };
    
    this.synth.speak(utter);
  }
};

if (typeof window !== 'undefined') {
  window.BillyLive = BillyLive;
  // Initialize voices
  window.speechSynthesis.onvoiceschanged = () => {
    BillyLive.voices = window.speechSynthesis.getVoices();
  };
}
