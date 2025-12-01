document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const html = document.documentElement;

    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let currentTheme = savedTheme || systemTheme;

    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark');
            themeText.textContent = 'Dark';
        } else {
            html.classList.remove('dark');
            themeText.textContent = 'Light';
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    applyTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // --- Navigation Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-white/90', 'dark:bg-[#000000]/90', 'backdrop-blur-2xl', 'shadow-[0_1px_0_0_rgba(0,0,0,0.05)]', 'dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]');
        } else {
            navbar.classList.remove('bg-white/90', 'dark:bg-[#000000]/90', 'backdrop-blur-2xl', 'shadow-[0_1px_0_0_rgba(0,0,0,0.05)]', 'dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]');
        }
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // --- Canvas Particle Animation ---
    const canvas = document.getElementById('background-field');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const cursor = { x: -1000, y: -1000, active: false, intensity: 0 };
    let lastMoveTime = Date.now();
    let animationFrameId;

    function resizeCanvas() {
        const maxDPR = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * maxDPR;
        canvas.height = window.innerHeight * maxDPR;
        ctx.scale(maxDPR, maxDPR);
    }

    function createParticles() {
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 50 : 100;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 1,
            });
        }
    }

    function updateParticles() {
        const now = Date.now();
        if (now - lastMoveTime > 100) {
            cursor.intensity *= 0.95;
        }

        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (cursor.active && cursor.intensity > 0.01) {
                const dx = cursor.x - particle.x;
                const dy = cursor.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 250) {
                    const force = (250 - distance) / 250;
                    const angle = Math.atan2(dy, dx);
                    const interaction = distance < 120 ? -1.2 : 0.3;
                    particle.vx += Math.cos(angle) * force * interaction * cursor.intensity;
                    particle.vy += Math.sin(angle) * force * interaction * cursor.intensity;
                }
            }

            particle.vx *= 0.96;
            particle.vy *= 0.96;

            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
        });
    }

    function draw() {
        const isDark = html.classList.contains('dark');
        const width = window.innerWidth;
        const height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        // Cursor Aura
        if (cursor.active && cursor.intensity > 0.01) {
            const outerGradient = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 300 * cursor.intensity);
            if (isDark) {
                outerGradient.addColorStop(0, `rgba(120, 170, 255, ${0.10 * cursor.intensity})`);
                outerGradient.addColorStop(0.3, `rgba(100, 150, 255, ${0.05 * cursor.intensity})`);
                outerGradient.addColorStop(0.6, `rgba(80, 130, 255, ${0.02 * cursor.intensity})`);
                outerGradient.addColorStop(1, 'rgba(60, 110, 255, 0)');
            } else {
                outerGradient.addColorStop(0, `rgba(120, 140, 220, ${0.06 * cursor.intensity})`);
                outerGradient.addColorStop(0.3, `rgba(100, 120, 200, ${0.03 * cursor.intensity})`);
                outerGradient.addColorStop(0.6, `rgba(80, 100, 180, ${0.01 * cursor.intensity})`);
                outerGradient.addColorStop(1, 'rgba(60, 80, 160, 0)');
            }
            ctx.fillStyle = outerGradient;
            ctx.fillRect(0, 0, width, height);

            const innerGradient = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 80 * cursor.intensity);
            if (isDark) {
                innerGradient.addColorStop(0, `rgba(180, 220, 255, ${0.15 * cursor.intensity})`);
                innerGradient.addColorStop(0.5, `rgba(140, 190, 255, ${0.08 * cursor.intensity})`);
                innerGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            } else {
                innerGradient.addColorStop(0, `rgba(160, 180, 255, ${0.10 * cursor.intensity})`);
                innerGradient.addColorStop(0.5, `rgba(130, 150, 230, ${0.05 * cursor.intensity})`);
                innerGradient.addColorStop(1, 'rgba(100, 120, 200, 0)');
            }
            ctx.fillStyle = innerGradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Connections
        const isMobile = window.innerWidth < 768;
        const connectionDistance = isMobile ? 120 : 150;
        if (!isMobile) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.12;
                        ctx.strokeStyle = isDark
                            ? `rgba(255, 255, 255, ${opacity})`
                            : `rgba(100, 100, 120, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Particles
        particles.forEach(particle => {
            ctx.fillStyle = isDark
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(100, 100, 120, 0.5)';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function animate() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            updateParticles();
        }
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }

    function handlePointerMove(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        cursor.x = clientX;
        cursor.y = clientY;
        cursor.active = true;
        cursor.intensity = Math.min(cursor.intensity + 0.3, 1);
        lastMoveTime = Date.now();
    }

    function handlePointerLeave() {
        cursor.active = false;
    }

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchstart', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    // Init Canvas
    resizeCanvas();
    createParticles();
    animate();
});
