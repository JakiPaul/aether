'use strict';

/**
 * AETHER // DIGITAL OBSERVATORY
 * Core Application Logic
 * Modular, clean, and optimized architecture.
 */
const AetherOS = (() => {
    
    // DOM Elements
    const elements = {
        bootScreen: document.getElementById('boot-screen'),
        bootText: document.getElementById('boot-text'),
        app: document.getElementById('app'),
        clock: document.getElementById('realtime-clock'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar'),
        counters: document.querySelectorAll('.counter'),
        canvas: document.getElementById('signal-canvas'),
        powerSwitch: document.getElementById('power-switch'),
        liveFreq: document.getElementById('live-freq'),
        consoleInput: document.getElementById('console-input'),
        consoleOutput: document.getElementById('console-output'),
        obsCards: document.querySelectorAll('.obs-card'),
        modal: document.getElementById('modal-container'),
        closeModalBtn: document.querySelector('.close-modal'),
        modalBackdrop: document.querySelector('.modal-backdrop'),
        toastContainer: document.getElementById('toast-container'),
        magneticBtns: document.querySelectorAll('.magnetic-btn'),
        navLinks: document.querySelectorAll('.nav-links a'),
        
        // Right UI Menu elements
        notifBtn: document.getElementById('notif-btn'),
        profileBtn: document.getElementById('profile-btn'),
        quickMenu: document.getElementById('quick-menu'),
        closeQuickMenuBtn: document.getElementById('close-quick-menu'),
        btnProfileAccess: document.getElementById('btn-profile-access'),
        btnDisconnect: document.getElementById('btn-disconnect')
    };

    // State
    const state = {
        isBooting: true,
        canvasActive: true,
        animationId: null,
        phase: 0
    };

    /**
     * System Boot Sequence
     */
    const initBootSequence = () => {
        const bootLines = [
            "INITIALIZING OBSERVATION CORE...",
            "ESTABLISHING SECURE CONNECTION...",
            "VISUAL ENGINE ........ ONLINE",
            "DATA CORE ............ ONLINE",
            "SENSOR NETWORK ....... ONLINE",
            "INTERFACE PARAMETERS . LOADED",
            "SYSTEM READY."
        ];
        
        let delay = 0;
        bootLines.forEach((line, index) => {
            setTimeout(() => {
                const p = document.createElement('div');
                p.textContent = `> ${line}`;
                if (elements.bootText) elements.bootText.appendChild(p);
                
                if (index === bootLines.length - 1) {
                    setTimeout(completeBoot, 600);
                }
            }, delay);
            delay += Math.random() * 300 + 150; 
        });
    };

    const completeBoot = () => {
        state.isBooting = false;
        elements.bootScreen.classList.remove('active');
        elements.app.classList.remove('hidden');
        
        // FIX: Memaksa canvas menggambar ulang ukurannya setelah layar boot hilang
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);

        initCounters();
        showToast("AETHER System Online");
    };

    /**
     * Realtime Clock
     */
    const updateClock = () => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        if (elements.clock) elements.clock.textContent = `${hrs}:${mins}:${secs}`;
    };

    /**
     * Right Quick Menu Logic
     */
    const initQuickMenu = () => {
        const toggleQuickMenu = (e) => {
            e.stopPropagation();
            elements.quickMenu.classList.toggle('open');
        };

        if (elements.notifBtn) elements.notifBtn.addEventListener('click', toggleQuickMenu);
        if (elements.profileBtn) elements.profileBtn.addEventListener('click', toggleQuickMenu);
        if (elements.closeQuickMenuBtn) elements.closeQuickMenuBtn.addEventListener('click', () => elements.quickMenu.classList.remove('open'));

        // Handle internal actions
        if (elements.btnProfileAccess) {
            elements.btnProfileAccess.addEventListener('click', () => {
                showToast("Profile Module is restricted.");
                elements.quickMenu.classList.remove('open');
            });
        }
        if (elements.btnDisconnect) {
            elements.btnDisconnect.addEventListener('click', () => {
                showToast("Disconnecting session...");
                elements.quickMenu.classList.remove('open');
                setTimeout(() => { location.reload(); }, 1500);
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.quickMenu && elements.quickMenu.classList.contains('open')) {
                if (!elements.quickMenu.contains(e.target)) {
                    elements.quickMenu.classList.remove('open');
                }
            }
        });
    };

    /**
     * Number Counters
     */
    const initCounters = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-target'));
                    animateValue(el, 0, target, 1500);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        elements.counters.forEach(counter => observer.observe(counter));
    };

    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const isDecimal = end % 1 !== 0;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = progress * (end - start);
            
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const easeCurrent = start + easeProgress * (end - start);
            
            obj.innerHTML = isDecimal ? easeCurrent.toFixed(1) : Math.floor(easeCurrent);
            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = end; 
        };
        window.requestAnimationFrame(step);
    };

    /**
     * Live Canvas Visualizer
     */
    const initVisualizer = () => {
        if (!elements.canvas) return;
        const ctx = elements.canvas.getContext('2d');
        
        const resize = () => {
            const parent = elements.canvas.parentElement;
            if (parent && parent.clientWidth > 0) {
                elements.canvas.width = parent.clientWidth;
                elements.canvas.height = parent.clientHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            if (!state.canvasActive) {
                ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
                return;
            }

            ctx.fillStyle = 'rgba(2, 2, 3, 0.2)';
            ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
            
            ctx.beginPath();
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            const cy = elements.canvas.height / 2;
            const amp = elements.canvas.height / 3;
            
            for (let x = 0; x < elements.canvas.width; x++) {
                const freq1 = Math.sin((x * 0.02) + state.phase);
                const freq2 = Math.sin((x * 0.05) + state.phase * 2) * 0.5;
                const noise = (Math.random() - 0.5) * 0.2;
                
                const y = cy + (freq1 + freq2 + noise) * amp;
                
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.stroke();
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f0ff';
            ctx.stroke();
            ctx.shadowBlur = 0;

            state.phase += 0.05;

            if (Math.random() > 0.95 && elements.liveFreq) {
                const f = (740 + Math.random() * 5).toFixed(2);
                elements.liveFreq.textContent = `${f} Hz`;
            }

            state.animationId = requestAnimationFrame(draw);
        };

        draw();

        if (elements.powerSwitch) {
            elements.powerSwitch.addEventListener('change', (e) => {
                state.canvasActive = e.target.checked;
                if (state.canvasActive) {
                    showToast("Live Instrument: ONLINE");
                    draw();
                } else {
                    showToast("Live Instrument: OFFLINE");
                    cancelAnimationFrame(state.animationId);
                    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
                    if (elements.liveFreq) elements.liveFreq.textContent = "0.00 Hz";
                }
            });
        }
    };

    /**
     * System Console
     */
    const initConsole = () => {
        if (!elements.consoleInput) return;

        const commands = {
            'help': 'Available commands: help, status, scan, clear, time',
            'status': 'SYSTEM: NOMINAL | CORE: ONLINE | NETWORK: STABLE',
            'scan': 'SCANNING... 3 ANOMALOUS SIGNALS DETECTED IN SECTOR 7.',
            'time': () => `CURRENT SYSTEM TIME: ${new Date().toLocaleTimeString()}`
        };

        const printOutput = (text, isCmd = false) => {
            const div = document.createElement('div');
            div.className = isCmd ? 'line cmd-echo' : 'line cmd-res';
            div.textContent = text;
            elements.consoleOutput.appendChild(div);
            elements.consoleOutput.scrollTop = elements.consoleOutput.scrollHeight;
        };

        elements.consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim().toLowerCase();
                if (!val) return;
                
                printOutput(`> ${val}`, true);
                e.target.value = '';

                if (val === 'clear') {
                    elements.consoleOutput.innerHTML = '<div class="line sys-msg">AETHER CONSOLE READY.</div>';
                    return;
                }

                setTimeout(() => {
                    if (commands[val]) {
                        const res = typeof commands[val] === 'function' ? commands[val]() : commands[val];
                        printOutput(res);
                        if(val === 'scan') showToast("Scan Complete. Anomalies found.");
                    } else {
                        printOutput(`ERROR: Command '${val}' not recognized.`);
                    }
                }, 300);
            }
        });
    };

    /**
     * Modals
     */
    const initModals = () => {
        if(!elements.modal) return;

        const openModal = (title) => {
            document.getElementById('modal-title').textContent = title;
            elements.modal.classList.remove('hidden');
        };

        const closeModal = () => elements.modal.classList.add('hidden');

        elements.obsCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.obs-title').textContent;
                openModal(title);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') openModal(card.querySelector('.obs-title').textContent);
            });
        });

        if (elements.closeModalBtn) elements.closeModalBtn.addEventListener('click', closeModal);
        if (elements.modalBackdrop) elements.modalBackdrop.addEventListener('click', closeModal);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) closeModal();
        });
    };

    /**
     * Toast Notifications
     */
    const showToast = (message) => {
        if (!elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast skeu-edge';
        toast.textContent = message;
        
        elements.toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    /**
     * Micro Interactions
     */
    const initInteractions = () => {
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const x = e.clientX;
                    const y = e.clientY;
                    const glow = document.querySelector('.cursor-glow');
                    if (glow) glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                    ticking = false;
                });
                ticking = true;
            }
        });

        elements.magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0px, 0px)';
            });
        });

        if (elements.menuToggle && elements.sidebar) {
            elements.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.sidebar.classList.toggle('open');
            });
            
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 950) {
                    if (elements.sidebar.classList.contains('open') && !elements.sidebar.contains(e.target) && !elements.menuToggle.contains(e.target)) {
                        elements.sidebar.classList.remove('open');
                    }
                }
            });
        }

        elements.navLinks.forEach(link => {
            link.addEventListener('click', function() {
                elements.navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                if(window.innerWidth <= 950) elements.sidebar.classList.remove('open');
            });
        });
    };

    const init = () => {
        initBootSequence();
        setInterval(updateClock, 1000);
        updateClock(); 
        initVisualizer();
        initConsole();
        initModals();
        initInteractions();
        initQuickMenu();
    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', AetherOS.init);