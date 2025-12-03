document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const toggle = document.getElementById("theme-toggle");
    const themeText = document.getElementById("theme-text");

    // Load saved theme
    if (localStorage.theme === "dark") {
        root.classList.add("dark");
        themeText.textContent = "Dark";
    }

    toggle.addEventListener("click", () => {
        root.classList.toggle("dark");
        const isDark = root.classList.contains("dark");

        localStorage.theme = isDark ? "dark" : "light";
        themeText.textContent = isDark ? "Dark" : "Light";
    });

    lucide.createIcons();


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

    // Typed Array Constants
    const PARTICLE_STRIDE = 8;
    // [x, y, baseVx, baseVy, vx, vy, radius, colorIndex]
    const P_X = 0, P_Y = 1, P_BASE_VX = 2, P_BASE_VY = 3, P_VX = 4, P_VY = 5, P_RADIUS = 6, P_COLOR = 7;

    let particlesData;
    let particleCount = 0;

    const cursor = { x: -1000, y: -1000, active: false, intensity: 0 };
    let lastMoveTime = Date.now();
    let animationFrameId;

    // Spatial Grid
    const GRID_CELL_SIZE = 150;
    let grid = {}; // Map cell key "x,y" to array of particle indices

    // Galaxy Theme Colors
    const COLORS_DARK = ['#FFFFFF', '#A0C4FF', '#BDB2FF']; // White, Light Blue, Light Purple
    const COLORS_LIGHT = ['#1B263B', '#240046', '#000000']; // Dark Blue, Dark Purple, Black

    function resizeCanvas() {
        const maxDPR = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * maxDPR;
        canvas.height = window.innerHeight * maxDPR;
        ctx.scale(maxDPR, maxDPR);
    }

    function createParticles() {
        const isMobile = window.innerWidth < 768;
        particleCount = isMobile ? 150 : 300; // Increased for starfield effect
        particlesData = new Float32Array(particleCount * PARTICLE_STRIDE);

        for (let i = 0; i < particleCount; i++) {
            const index = i * PARTICLE_STRIDE;
            particlesData[index + P_X] = Math.random() * window.innerWidth;
            particlesData[index + P_Y] = Math.random() * window.innerHeight;
            // Slower, ambient drift for galaxy feel
            particlesData[index + P_BASE_VX] = (Math.random() - 0.5) * 0.2;
            particlesData[index + P_BASE_VY] = (Math.random() - 0.5) * 0.2;
            particlesData[index + P_VX] = 0;
            particlesData[index + P_VY] = 0;

            // Size distribution: mostly small stars, few larger ones
            const r = Math.random();
            particlesData[index + P_RADIUS] = r < 0.8 ? Math.random() * 1 + 0.5 : Math.random() * 1.5 + 1;

            // Random color index (0-2)
            particlesData[index + P_COLOR] = Math.floor(Math.random() * 3);
        }
    }

    function updateParticles() {
        const now = Date.now();
        if (now - lastMoveTime > 100) {
            cursor.intensity *= 0.95;
        }

        // Clear Grid
        grid = {};

        const width = window.innerWidth;
        const height = window.innerHeight;

        for (let i = 0; i < particleCount; i++) {
            const index = i * PARTICLE_STRIDE;

            // Update Position
            particlesData[index + P_X] += particlesData[index + P_BASE_VX] + particlesData[index + P_VX];
            particlesData[index + P_Y] += particlesData[index + P_BASE_VY] + particlesData[index + P_VY];

            // Interaction
            if (cursor.active && cursor.intensity > 0.01) {
                const dx = cursor.x - particlesData[index + P_X];
                const dy = cursor.y - particlesData[index + P_Y];
                const distSq = dx * dx + dy * dy;

                if (distSq < 62500) { // 250^2
                    const distance = Math.sqrt(distSq);
                    const force = (250 - distance) / 250;
                    const angle = Math.atan2(dy, dx);
                    const interaction = distance < 120 ? -1.2 : 0.3;

                    particlesData[index + P_VX] += Math.cos(angle) * force * interaction * cursor.intensity;
                    particlesData[index + P_VY] += Math.sin(angle) * force * interaction * cursor.intensity;
                }
            }

            // Friction
            particlesData[index + P_VX] *= 0.96;
            particlesData[index + P_VY] *= 0.96;

            // Wrap around
            if (particlesData[index + P_X] < 0) particlesData[index + P_X] = width;
            if (particlesData[index + P_X] > width) particlesData[index + P_X] = 0;
            if (particlesData[index + P_Y] < 0) particlesData[index + P_Y] = height;
            if (particlesData[index + P_Y] > height) particlesData[index + P_Y] = 0;

            // Add to Grid
            const gx = Math.floor(particlesData[index + P_X] / GRID_CELL_SIZE);
            const gy = Math.floor(particlesData[index + P_Y] / GRID_CELL_SIZE);
            const key = `${gx},${gy}`;
            if (!grid[key]) grid[key] = [];
            grid[key].push(index);
        }
    }

    function draw() {
        const isDark = root.classList.contains('dark');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

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

        // Connections & Particles
        const isMobile = window.innerWidth < 768;
        const connectionDistSq = isMobile ? 14400 : 22500; // 120^2 or 150^2

        // Drawing Connections
        if (!isMobile) {
            ctx.lineWidth = 0.5;
            const cells = Object.keys(grid);
            for (const key of cells) {
                const [gx, gy] = key.split(',').map(Number);
                const cellParticles = grid[key];

                // Internal checks
                for (let i = 0; i < cellParticles.length; i++) {
                    const idxA = cellParticles[i];

                    // Check against other particles in same cell
                    for (let j = i + 1; j < cellParticles.length; j++) {
                        const idxB = cellParticles[j];
                        drawConnection(idxA, idxB, connectionDistSq, isDark);
                    }

                    // Check neighbor cells
                    const neighborOffsets = [[1, 0], [0, 1], [1, 1], [-1, 1]];
                    for (const [ox, oy] of neighborOffsets) {
                        const nKey = `${gx + ox},${gy + oy}`;
                        if (grid[nKey]) {
                            const neighborParticles = grid[nKey];
                            for (const idxB of neighborParticles) {
                                drawConnection(idxA, idxB, connectionDistSq, isDark);
                            }
                        }
                    }
                }
            }
        }

        // Draw Particles with Stretch
        for (let i = 0; i < particleCount; i++) {
            const index = i * PARTICLE_STRIDE;
            const x = particlesData[index + P_X];
            const y = particlesData[index + P_Y];
            const vx = particlesData[index + P_BASE_VX] + particlesData[index + P_VX];
            const vy = particlesData[index + P_BASE_VY] + particlesData[index + P_VY];
            const speed = Math.sqrt(vx * vx + vy * vy);
            const radius = particlesData[index + P_RADIUS];
            const colorIdx = particlesData[index + P_COLOR];

            // Base color from palette
            const baseColor = colors[colorIdx];

            // Opacity based on theme
            const alpha = isDark ? 0.8 : 0.7;

            ctx.fillStyle = hexToRgba(baseColor, alpha);

            ctx.beginPath();

            if (speed > 0.5) {
                // Stretch effect
                const angle = Math.atan2(vy, vx);
                const stretch = Math.min(speed * 5, 15);
                ctx.ellipse(x, y, radius + stretch, radius, angle, 0, Math.PI * 2);
            } else {
                ctx.arc(x, y, radius, 0, Math.PI * 2);
            }

            ctx.fill();
        }
    }

    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function drawConnection(idxA, idxB, maxDistSq, isDark) {
        const dx = particlesData[idxA + P_X] - particlesData[idxB + P_X];
        const dy = particlesData[idxA + P_Y] - particlesData[idxB + P_Y];
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
            const distance = Math.sqrt(distSq);
            const maxDist = Math.sqrt(maxDistSq);
            const opacity = (1 - distance / maxDist) * 0.12;

            ctx.strokeStyle = isDark
                ? `rgba(255, 255, 255, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`;

            ctx.beginPath();
            ctx.moveTo(particlesData[idxA + P_X], particlesData[idxA + P_Y]);
            ctx.lineTo(particlesData[idxB + P_X], particlesData[idxB + P_Y]);
            ctx.stroke();
        }
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
