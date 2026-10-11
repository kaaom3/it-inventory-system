/**
 * ============================================================================
 * 🤖 Modern AI Assistant (Abdul AI) - Modular Clean Architecture
 * Features:
 *  - Dify AI Backend integration with image analysis
 *  - ElevenLabs Voice Synthesis (eleven_v4) with Web Speech Fallback
 *  - Thai Speech-to-Text (Continuous Live Call + Push-to-Talk)
 *  - Ultra-modern Glassmorphism UI with Audio Controls & Quick Prompts
 * ============================================================================
 */

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.isMaximized = false;
        this.isLiveMode = false;
        this.isMuted = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.selectedVoiceId = 'Yo0WmPHbg2TY6FYOSr3u'; // User Default Voice
        this.voices = [];
        this.recognition = null;
        this.currentAudio = null;
        this.silenceTimeout = null;
        this.selectedImageBase64 = null;

        this.init();
    }

    init() {
        this.renderUI();
        this.bindEvents();
        this.initSpeechRecognition();
        this.loadVoices();
    }

    // ------------------------------------------------------------------------
    // 🎨 UI Rendering
    // ------------------------------------------------------------------------
    renderUI() {
        const root = document.getElementById('ai-assistant-root') || document.body;
        
        const container = document.createElement('div');
        container.id = 'ai-assistant-container';
        container.className = 'fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none';
        container.innerHTML = `
            <!-- Chat Window -->
            <div id="ai-modal" class="hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-[370px] sm:w-[420px] h-[580px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] rounded-3xl flex-col overflow-hidden mb-4 border border-gray-100 dark:border-gray-800 transition-all duration-300 origin-bottom-right">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white px-5 py-3.5 flex justify-between items-center shrink-0 shadow-md relative z-20">
                    <div class="flex items-center space-x-3">
                        <div class="relative">
                            <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/30">
                                <i class="fas fa-robot text-white drop-shadow"></i>
                            </div>
                            <span id="ai-status-dot" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-indigo-700 rounded-full"></span>
                        </div>
                        <div>
                            <div class="font-bold text-sm tracking-wide flex items-center">
                                อับดุล AI 
                                <span class="ml-1.5 px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-normal">v2.0</span>
                            </div>
                            <div id="ai-status-text" class="text-[11px] text-indigo-100 opacity-90">พร้อมให้บริการ</div>
                        </div>
                    </div>

                    <!-- Header Actions -->
                    <div class="flex items-center space-x-1.5">
                        <!-- Voice Selector -->
                        <select id="ai-voice-select" class="text-xs bg-black/20 hover:bg-black/30 text-white rounded-lg px-2 py-1 outline-none border border-white/20 cursor-pointer transition-colors max-w-[110px] truncate" title="เลือกเสียง AI">
                            <option value="Yo0WmPHbg2TY6FYOSr3u" class="text-gray-900">เสียงโคลน (Auu)</option>
                            <option value="__browser__" class="text-gray-900">เสียงในเครื่อง (Web Speech)</option>
                        </select>

                        <!-- Sound Toggle (Mute/Unmute) -->
                        <button id="ai-btn-sound" class="w-8 h-8 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all" title="เปิด/ปิดเสียงพูด">
                            <i class="fas fa-volume-up text-sm" id="ai-sound-icon"></i>
                        </button>

                        <!-- Live Call Button -->
                        <button id="ai-btn-call" class="w-8 h-8 rounded-xl flex items-center justify-center text-white/90 hover:text-green-300 hover:bg-white/20 transition-all" title="โทรคุยสด (Live Call)">
                            <i class="fas fa-headset text-sm"></i>
                        </button>

                        <!-- Maximize Toggle -->
                        <button id="ai-btn-expand" class="w-8 h-8 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all" title="ขยาย/ย่อ">
                            <i class="fas fa-expand text-xs" id="ai-expand-icon"></i>
                        </button>

                        <!-- Close -->
                        <button id="ai-btn-close" class="w-8 h-8 rounded-xl flex items-center justify-center text-white/90 hover:text-red-300 hover:bg-red-500/30 transition-all" title="ปิดหน้าต่าง">
                            <i class="fas fa-times text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Messages Container -->
                <div id="ai-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60 dark:bg-gray-900/60 text-sm relative scroll-smooth custom-scrollbar">
                    
                    <!-- Live Voice Call Overlay -->
                    <div id="ai-call-overlay" class="absolute inset-0 bg-gray-900/95 backdrop-blur-md z-30 hidden flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
                        <div class="relative mb-6">
                            <div id="ai-call-pulse" class="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-40"></div>
                            <div class="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl border-4 border-white/20">
                                <i id="ai-call-icon" class="fas fa-microphone text-4xl text-white"></i>
                            </div>
                        </div>
                        <h3 id="ai-call-title" class="text-xl font-bold mb-2">กำลังฟังเสียงของคุณ...</h3>
                        <p id="ai-call-subtitle" class="text-gray-300 text-sm max-w-[260px] min-h-[40px] italic">พูดสิ่งที่ต้องการค้นหาหรือสอบถามได้เลย</p>
                        
                        <div class="flex items-center space-x-4 mt-8">
                            <button id="ai-call-mute" class="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg border border-gray-700">
                                <i class="fas fa-microphone-slash"></i>
                            </button>
                            <button id="ai-call-end" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold shadow-xl transition-all flex items-center space-x-2 text-white">
                                <i class="fas fa-phone-slash mr-1"></i>
                                <span>วางสาย</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bot Welcome Message -->
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md border border-white/40 mt-0.5">
                            <i class="fas fa-robot text-xs"></i>
                        </div>
                        <div class="space-y-2 max-w-[85%]">
                            <div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700/80 leading-relaxed text-[13.5px]">
                                สวัสดีครับ! ผม <strong>"อับดุล AI"</strong> ผู้ช่วยระบบพัสดุและอุปกรณ์ 🤖✨<br>
                                คุณสามารถพิมพ์ถาม สั่งงาน หรือกดปุ่ม <strong>หูฟัง 🎧</strong> ด้านบนเพื่อโทรคุยสดกับผมได้เลยครับ!
                            </div>
                            
                            <!-- Quick Chips -->
                            <div class="flex flex-wrap gap-1.5 pt-1">
                                <button class="ai-chip text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 transition-all text-left">
                                    🔍 ค้นหาอุปกรณ์ในสต็อก
                                </button>
                                <button class="ai-chip text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 transition-all text-left">
                                    📊 สรุปยอดคงเหลือ
                                </button>
                                <button class="ai-chip text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 transition-all text-left">
                                    📋 วิธีการยืม-คืนของ
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Input Footer -->
                <div class="p-3.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/60 flex flex-col shrink-0 shadow-lg relative z-20">
                    
                    <!-- Image Preview Badge -->
                    <div id="ai-img-preview-box" class="hidden mb-2 relative inline-block">
                        <div class="relative inline-block group">
                            <img id="ai-img-preview" class="h-16 w-16 object-cover rounded-xl border-2 border-indigo-300 shadow-md">
                            <button id="ai-img-remove" class="absolute -top-1.5 -right-1.5 bg-gray-900 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow transition-colors border-2 border-white">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-end space-x-2 bg-gray-100/80 dark:bg-gray-700/50 p-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 transition-all">
                        
                        <!-- Attach File Button -->
                        <input type="file" id="ai-file-input" accept="image/*" class="hidden">
                        <button id="ai-btn-attach" class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-600 transition-all shrink-0" title="แนบรูปภาพ">
                            <i class="fas fa-paperclip text-sm"></i>
                        </button>

                        <!-- Input Textarea -->
                        <textarea id="ai-input" rows="1" placeholder="พิมพ์ข้อความ หรือกดไมค์เพื่อพูด..." class="flex-1 bg-transparent text-gray-900 dark:text-white px-2 py-2 focus:outline-none text-sm resize-none custom-scrollbar max-h-28 min-h-[38px] leading-relaxed"></textarea>

                        <!-- Mic & Send Buttons -->
                        <div class="flex items-center space-x-1 shrink-0 p-0.5">
                            <button id="ai-btn-mic" class="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all" title="พูดข้อความ">
                                <i class="fas fa-microphone text-sm"></i>
                            </button>
                            <button id="ai-btn-send" class="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:scale-105 active:scale-95" title="ส่ง">
                                <i class="fas fa-arrow-up text-sm"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-center mt-1.5 text-[10px] text-gray-400 font-medium">
                        อับดุล AI สามารถตอบและทำงานอัตโนมัติร่วมกับระบบคลังพัสดุ
                    </div>
                </div>

            </div>

            <!-- Floating Action Button (FAB) -->
            <button id="ai-fab" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-[0_10px_25px_rgba(79,70,229,0.45)] flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/30 relative group">
                <i class="fas fa-sparkles text-xl group-hover:rotate-12 transition-transform"></i>
                <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border-2 border-white"></span>
                </span>
            </button>
        `;

        root.appendChild(container);
    }

    // ------------------------------------------------------------------------
    // 🔗 Event Bindings
    // ------------------------------------------------------------------------
    bindEvents() {
        const fab = document.getElementById('ai-fab');
        const modal = document.getElementById('ai-modal');
        const btnClose = document.getElementById('ai-btn-close');
        const btnExpand = document.getElementById('ai-btn-expand');
        const btnSound = document.getElementById('ai-btn-sound');
        const btnCall = document.getElementById('ai-btn-call');
        const btnSend = document.getElementById('ai-btn-send');
        const btnMic = document.getElementById('ai-btn-mic');
        const btnAttach = document.getElementById('ai-btn-attach');
        const fileInput = document.getElementById('ai-file-input');
        const input = document.getElementById('ai-input');
        const btnImgRemove = document.getElementById('ai-img-remove');
        const voiceSelect = document.getElementById('ai-voice-select');
        const btnCallEnd = document.getElementById('ai-call-end');
        const btnCallMute = document.getElementById('ai-call-mute');

        // Toggle Open/Close
        fab.addEventListener('click', () => this.toggleModal());
        btnClose.addEventListener('click', () => this.toggleModal(false));

        // Maximize
        btnExpand.addEventListener('click', () => {
            this.isMaximized = !this.isMaximized;
            const icon = document.getElementById('ai-expand-icon');
            if (this.isMaximized) {
                modal.classList.remove('w-[370px]', 'sm:w-[420px]', 'h-[580px]');
                modal.classList.add('w-[90vw]', 'sm:w-[600px]', 'h-[85vh]');
                icon.className = 'fas fa-compress text-xs';
            } else {
                modal.classList.remove('w-[90vw]', 'sm:w-[600px]', 'h-[85vh]');
                modal.classList.add('w-[370px]', 'sm:w-[420px]', 'h-[580px]');
                icon.className = 'fas fa-expand text-xs';
            }
        });

        // Mute Toggle
        btnSound.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            const icon = document.getElementById('ai-sound-icon');
            icon.className = this.isMuted ? 'fas fa-volume-mute text-sm text-red-300' : 'fas fa-volume-up text-sm';
            if (this.isMuted && this.currentAudio) {
                this.currentAudio.pause();
            }
        });

        // Voice Select
        voiceSelect.addEventListener('change', (e) => {
            this.selectedVoiceId = e.target.value;
        });

        // Live Call Button
        btnCall.addEventListener('click', () => this.toggleLiveCall());
        btnCallEnd.addEventListener('click', () => this.toggleLiveCall(false));

        // Send
        btnSend.addEventListener('click', () => this.handleSendMessage());

        // Textarea Enter & Auto-resize
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = `${input.scrollHeight}px`;
            if (!input.value) input.style.height = 'auto';
        });

        // Image Attachment
        btnAttach.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.selectedImageBase64 = evt.target.result;
                    document.getElementById('ai-img-preview').src = this.selectedImageBase64;
                    document.getElementById('ai-img-preview-box').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
        btnImgRemove.addEventListener('click', () => {
            this.selectedImageBase64 = null;
            fileInput.value = '';
            document.getElementById('ai-img-preview-box').classList.add('hidden');
        });

        // Mic Push-to-Talk / Tap-to-Talk
        btnMic.addEventListener('click', () => this.handleMicClick());

        // Quick Chips
        document.querySelectorAll('.ai-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.innerText.trim();
                this.handleSendMessage();
            });
        });
    }

    toggleModal(forceState = null) {
        const modal = document.getElementById('ai-modal');
        this.isOpen = forceState !== null ? forceState : !this.isOpen;
        if (this.isOpen) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.getElementById('ai-input').focus();
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            if (this.isLiveMode) this.toggleLiveCall(false);
        }
    }

    // ------------------------------------------------------------------------
    // 🎙️ Voice & Speech Engine (STT & TTS)
    // ------------------------------------------------------------------------
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported in this browser");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'th-TH';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus("กำลังฟังเสียง...", "bg-yellow-400");
            document.getElementById('ai-btn-mic').classList.add('text-red-500', 'animate-pulse');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentText = finalTranscript || interimTranscript;

            if (this.isLiveMode) {
                document.getElementById('ai-call-subtitle').innerText = currentText || "กำลังฟัง...";
            } else {
                document.getElementById('ai-input').value = currentText;
            }

            // Auto-send in Live Mode when user finishes speaking
            if (this.isLiveMode && finalTranscript.trim().length > 0) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = setTimeout(() => {
                    this.recognition.stop();
                    this.handleSendMessage(finalTranscript.trim());
                }, 1300); // 1.3s pause triggers response
            }
        };

        this.recognition.onerror = (e) => {
            console.warn("Speech Recognition Error:", e);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            document.getElementById('ai-btn-mic').classList.remove('text-red-500', 'animate-pulse');
            if (!this.isSpeaking && !this.isLiveMode) {
                this.updateStatus("พร้อมให้บริการ", "bg-green-400");
            }
        };
    }

    handleMicClick() {
        if (!this.recognition) {
            alert("เบราว์เซอร์นี้ไม่รองรับการแปลงเสียงเป็นข้อความ กรุณาใช้ Chrome หรือ Edge ครับ");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error(e);
            }
        }
    }

    toggleLiveCall(forceState = null) {
        this.isLiveMode = forceState !== null ? forceState : !this.isLiveMode;
        const overlay = document.getElementById('ai-call-overlay');

        if (this.isLiveMode) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            this.startLiveListening();
        } else {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            if (this.recognition) this.recognition.stop();
            if (this.currentAudio) this.currentAudio.pause();
            clearTimeout(this.silenceTimeout);
            this.updateStatus("พร้อมให้บริการ", "bg-green-400");
        }
    }

    startLiveListening() {
        if (!this.isLiveMode || !this.recognition) return;
        
        document.getElementById('ai-call-title').innerText = "กำลังฟังเสียงของคุณ...";
        document.getElementById('ai-call-subtitle').innerText = "พูดสิ่งที่ต้องการถามได้เลยครับ";
        document.getElementById('ai-call-icon').className = "fas fa-microphone text-4xl text-white";
        document.getElementById('ai-call-pulse').className = "absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-40";

        try {
            this.recognition.start();
        } catch (e) {
            // Already started
        }
    }

    async loadVoices() {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/tts/voices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                this.voices = data;
                const select = document.getElementById('ai-voice-select');
                if (select && data.length > 0) {
                    select.innerHTML = `
                        <option value="Yo0WmPHbg2TY6FYOSr3u" class="text-gray-900">เสียงโคลน (Auu)</option>
                        ${data.map(v => `<option value="${v.voice_id}" class="text-gray-900">${v.name}</option>`).join('')}
                        <option value="__browser__" class="text-gray-900">เสียงในเครื่อง (Web Speech)</option>
                    `;
                    select.value = this.selectedVoiceId;
                }
            }
        } catch (error) {
            console.warn("Could not load ElevenLabs voices:", error);
        }
    }

    // ------------------------------------------------------------------------
    // 🔊 Voice Synthesis (ElevenLabs eleven_v4 + Web Speech Fallback)
    // ------------------------------------------------------------------------
    async speak(text) {
        if (this.isMuted || !text) {
            if (this.isLiveMode) this.startLiveListening();
            return;
        }

        this.isSpeaking = true;
        this.updateStatus("กำลังพูดตอบกลับ...", "bg-purple-400");

        if (this.isLiveMode) {
            document.getElementById('ai-call-title').innerText = "อับดุลกำลังพูด...";
            document.getElementById('ai-call-icon').className = "fas fa-volume-up text-4xl text-white";
            document.getElementById('ai-call-pulse').className = "absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50";
        }

        // Clean text for natural speech
        const cleanText = text
            .replace(/<[^>]+>/g, ' ')
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/[#*_~`>[\]\\()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // 1. If user explicitly selected Web Speech in dropdown
        if (this.selectedVoiceId === '__browser__') {
            this.speakWebSpeech(cleanText);
            return;
        }

        // 2. Try ElevenLabs API
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/tts/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: cleanText,
                    voiceId: this.selectedVoiceId
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`TTS failed (${res.status}): ${errText}`);
            }

            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);

            if (this.currentAudio) this.currentAudio.pause();
            this.currentAudio = new Audio(audioUrl);

            this.currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.isSpeaking = false;
                this.updateStatus("พร้อมให้บริการ", "bg-green-400");
                if (this.isLiveMode) this.startLiveListening();
            };

            this.currentAudio.onerror = () => {
                console.warn("Audio playback error, falling back to Web Speech...");
                this.speakWebSpeech(cleanText);
            };

            await this.currentAudio.play();

        } catch (error) {
            console.warn("ElevenLabs TTS failed, falling back to browser Web Speech:", error.message);
            this.speakWebSpeech(cleanText);
        }
    }

    speakWebSpeech(cleanText) {
        if (!('speechSynthesis' in window)) {
            this.isSpeaking = false;
            if (this.isLiveMode) this.startLiveListening();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'th-TH';
        utterance.rate = 1.05;

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus("พร้อมให้บริการ", "bg-green-400");
            if (this.isLiveMode) this.startLiveListening();
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            if (this.isLiveMode) this.startLiveListening();
        };

        window.speechSynthesis.speak(utterance);
    }

    // ------------------------------------------------------------------------
    // 💬 Chat & Dify Communication
    // ------------------------------------------------------------------------
    async handleSendMessage(overrideText = null) {
        const input = document.getElementById('ai-input');
        const text = overrideText !== null ? overrideText : input.value.trim();
        const image = this.selectedImageBase64;

        if (!text && !image) return;

        // Reset Input Box
        input.value = '';
        input.style.height = 'auto';
        this.selectedImageBase64 = null;
        document.getElementById('ai-file-input').value = '';
        document.getElementById('ai-img-preview-box').classList.add('hidden');

        // Append User Message
        this.appendMessage(text, 'user', image);

        // Show Thinking Indicator
        const loadingId = this.showThinkingIndicator();
        this.updateStatus("กำลังประมวลผลคำตอบ...", "bg-yellow-400");

        if (this.isLiveMode) {
            document.getElementById('ai-call-title').innerText = "อับดุลกำลังคิด...";
            document.getElementById('ai-call-subtitle').innerText = `"${text}"`;
            document.getElementById('ai-call-icon').className = "fas fa-spinner fa-spin text-4xl text-white";
            document.getElementById('ai-call-pulse').className = "absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-40";
        }

        try {
            const token = localStorage.getItem('authToken');
            const payload = { prompt: text || "อธิบายรูปภาพนี้" };
            if (image) payload.image = image;

            const res = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            this.removeThinkingIndicator(loadingId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server error (${res.status})`);
            }

            const data = await res.json();
            const reply = data.reply || "ไม่ได้รับคำตอบจากระบบ";

            this.appendMessage(reply, 'ai');
            this.speak(reply);

        } catch (error) {
            this.removeThinkingIndicator(loadingId);
            this.appendMessage(`เกิดข้อผิดพลาด: ${error.message}`, 'ai', null, true);
            this.updateStatus("เกิดข้อผิดพลาด", "bg-red-400");
            if (this.isLiveMode) this.startLiveListening();
        }
    }

    appendMessage(text, sender, imageUrl = null, isError = false) {
        const container = document.getElementById('ai-messages');
        const wrapper = document.createElement('div');
        wrapper.className = 'animate-fade-in-up';

        const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            wrapper.className += ' flex justify-end';
            wrapper.innerHTML = `
                <div class="space-y-1 max-w-[85%] text-right">
                    ${imageUrl ? `<img src="${imageUrl}" class="w-48 h-32 object-cover rounded-2xl ml-auto mb-1 border-2 border-indigo-400/40 shadow-md">` : ''}
                    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-left text-[13.5px] leading-relaxed">
                        ${this.escapeHtml(text)}
                    </div>
                    <span class="text-[10px] text-gray-400 pr-1">${timeStr}</span>
                </div>
            `;
        } else {
            wrapper.className += ' flex items-start space-x-3';
            
            // Format markdown or plain text
            let formattedText = text;
            if (window.marked && !isError) {
                try { formattedText = window.marked.parse(text); } catch (e) {}
            } else {
                formattedText = text.replace(/\n/g, '<br>');
            }

            const bubbleBg = isError 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700/80';

            wrapper.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md border border-white/40 mt-1">
                    <i class="fas fa-robot text-xs"></i>
                </div>
                <div class="space-y-1 max-w-[85%]">
                    <div class="${bubbleBg} p-4 rounded-2xl rounded-tl-sm shadow-sm border leading-relaxed text-[13.5px] markdown-body">
                        ${formattedText}
                    </div>
                    <div class="flex items-center space-x-2 pl-1">
                        <span class="text-[10px] text-gray-400">${timeStr}</span>
                        <button class="ai-replay-btn text-[11px] text-gray-400 hover:text-indigo-600 transition-colors" title="กดเพื่อฟังเสียงซ้ำ">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
            `;

            // Bind replay audio button
            const replayBtn = wrapper.querySelector('.ai-replay-btn');
            if (replayBtn) {
                replayBtn.addEventListener('click', () => this.speak(text));
            }
        }

        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
    }

    showThinkingIndicator() {
        const container = document.getElementById('ai-messages');
        const id = `loading-${Date.now()}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-start space-x-3 animate-fade-in-up';
        div.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md border border-white/40 mt-1">
                <i class="fas fa-robot text-xs"></i>
            </div>
            <div class="bg-white dark:bg-gray-800 text-gray-400 p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700/80 flex items-center space-x-1.5 h-10">
                <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                <div class="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            </div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return id;
    }

    removeThinkingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    updateStatus(text, dotColorClass) {
        const statusText = document.getElementById('ai-status-text');
        const dot = document.getElementById('ai-status-dot');
        if (statusText) statusText.innerText = text;
        if (dot) {
            dot.className = `absolute -bottom-0.5 -right-0.5 w-3 h-3 ${dotColorClass} border-2 border-indigo-700 rounded-full transition-colors`;
        }
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// 🚀 Self-Instantiate when DOM is Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiAssistant = new AIAssistant();
    });
} else {
    window.aiAssistant = new AIAssistant();
}
