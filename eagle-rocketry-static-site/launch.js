(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const easeInCubic = value => value * value * value;
  const easeOutCubic = value => 1 - Math.pow(1 - value, 3);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const intro = $('#intro');
  const loaderOrbit = $('#loader-orbit');
  const loaderProgress = $('#loader-progress');
  const loaderCount = $('#loader-count');
  const introStatus = $('#intro-status');
  const launchRocket = $('#launch-rocket');
  const skipIntro = $('#skip-intro');
  const replayLaunch = $('#replay-launch');
  const smokeCanvas = $('#smoke');
  const smokeContext = smokeCanvas.getContext('2d');
  const heroVisual = $('.hero-visual');

  const circumference = 2 * Math.PI * 104;
  loaderProgress.style.strokeDasharray = `${circumference}`;
  loaderProgress.style.strokeDashoffset = `${circumference}`;

  let width = innerWidth;
  let height = innerHeight;
  let pixelRatio = 1;
  let sequenceStart = performance.now();
  let sequenceRunning = !reducedMotion;
  let sequenceFinished = false;
  let previousTime = performance.now();
  let smokeParticles = [];
  let lastSmokeSpawn = 0;
  let lastGroundSpawn = 0;
  let revealStarted = false;

  const resize = () => {
    width = innerWidth;
    height = innerHeight;
    pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    smokeCanvas.width = Math.round(width * pixelRatio);
    smokeCanvas.height = Math.round(height * pixelRatio);
    smokeCanvas.style.width = `${width}px`;
    smokeCanvas.style.height = `${height}px`;
    smokeContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const spawnSmoke = (x, y, intensity = 1, mode = 'trail') => {
    const groundCloud = mode === 'ground';
    const count = Math.max(3, Math.round((groundCloud ? 4.5 : 7) * intensity));
    for (let index = 0; index < count; index++) {
      smokeParticles.push({
        x: x + (Math.random() - .5) * (groundCloud ? 120 : 48),
        y: y + Math.random() * (groundCloud ? 24 : 14),
        vx: (Math.random() - .5) * (groundCloud ? 560 : 180),
        vy: groundCloud ? -18 - Math.random() * 78 : 28 + Math.random() * 88,
        radius: groundCloud ? 58 + Math.random() * 76 : 26 + Math.random() * 48,
        growth: groundCloud ? 88 + Math.random() * 115 : 42 + Math.random() * 72,
        life: 0,
        maxLife: groundCloud ? 3.6 + Math.random() * 1.8 : 1.9 + Math.random() * 1.5,
        shade: Math.random()
      });
    }
  };

  const paintSmoke = delta => {
    smokeContext.clearRect(0, 0, width, height);
    smokeParticles = smokeParticles.filter(particle => {
      particle.life += delta;
      if (particle.life >= particle.maxLife) return false;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= .985;
      particle.radius += particle.growth * delta;
      const remaining = 1 - particle.life / particle.maxLife;
      const alpha = Math.sin(Math.min(1, particle.life * 3) * Math.PI / 2) * remaining * (.17 + particle.shade * .14);
      const gradient = smokeContext.createRadialGradient(particle.x, particle.y, particle.radius * .08, particle.x, particle.y, particle.radius);
      gradient.addColorStop(0, `rgba(205,211,210,${alpha})`);
      gradient.addColorStop(.5, `rgba(138,150,154,${alpha * .88})`);
      gradient.addColorStop(1, 'rgba(87,107,116,0)');
      smokeContext.fillStyle = gradient;
      smokeContext.beginPath();
      smokeContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      smokeContext.fill();
      return true;
    });
  };

  const finishSequence = () => {
    if (sequenceFinished) return;
    sequenceFinished = true;
    sequenceRunning = false;
    document.body.classList.remove('intro-active');
    intro.classList.add('done');
    skipIntro.hidden = true;
    smokeCanvas.style.visibility = 'hidden';
    smokeContext.clearRect(0, 0, width, height);
  };

  const startSequence = () => {
    if (reducedMotion) {
      scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollTo(0, 0);
    sequenceStart = performance.now();
    previousTime = sequenceStart;
    sequenceRunning = true;
    sequenceFinished = false;
    smokeParticles = [];
    lastSmokeSpawn = 0;
    lastGroundSpawn = 0;
    revealStarted = false;
    loaderCount.textContent = '000';
    loaderProgress.style.strokeDashoffset = `${circumference}`;
    introStatus.textContent = 'Loading';
    loaderOrbit.classList.remove('resolved');
    launchRocket.classList.remove('launching');
    launchRocket.style.opacity = '0';
    launchRocket.style.transform = 'translate3d(-50%, 88vh, 0) scale(1)';
    document.body.classList.add('intro-active');
    intro.classList.remove('done', 'launch-phase');
    skipIntro.hidden = false;
    smokeCanvas.style.visibility = 'visible';
    smokeCanvas.classList.remove('clearing');
  };

  const updateSequence = now => {
    const elapsed = (now - sequenceStart) / 1000;
    const delta = Math.min((now - previousTime) / 1000, .05);
    previousTime = now;

    const loadProgress = clamp(elapsed / 2.65, 0, 1);
    const displayProgress = Math.round(easeOutCubic(loadProgress) * 100);
    loaderCount.textContent = String(displayProgress).padStart(3, '0');
    loaderProgress.style.strokeDashoffset = `${circumference * (1 - loadProgress)}`;

    if (elapsed < 2.65) introStatus.textContent = 'Loading';

    if (elapsed >= 2.65 && elapsed < 3.12) {
      loaderCount.textContent = '100';
      loaderOrbit.classList.add('resolved');
      introStatus.textContent = 'Ready';
    }

    if (elapsed >= 3.05) {
      intro.classList.add('launch-phase');
      launchRocket.classList.add('launching');
      const launchProgress = clamp((elapsed - 3.05) / 2.45, 0, 1);
      const travel = easeInCubic(launchProgress);
      const startY = height * .78;
      const endY = -height * 1.65;
      const y = lerp(startY, endY, travel);
      const scale = lerp(1, .68, launchProgress);
      launchRocket.style.opacity = `${clamp(launchProgress * 7, 0, 1)}`;
      launchRocket.style.transform = `translate3d(-50%, ${y}px, 0) scale(${scale})`;
      introStatus.textContent = launchProgress < .14 ? 'Ignition' : 'Liftoff';

      if (launchProgress < .82 && now - lastSmokeSpawn > 28) {
        const rect = launchRocket.getBoundingClientRect();
        spawnSmoke(rect.left + rect.width / 2, Math.min(height + 30, rect.bottom - 16), launchProgress < .22 ? 2.6 : 1.45, 'trail');
        lastSmokeSpawn = now;
      }

      if (launchProgress > .08 && launchProgress < .78 && now - lastGroundSpawn > 58) {
        spawnSmoke(width / 2, height - 26, 1.25 + launchProgress * 1.4, 'ground');
        lastGroundSpawn = now;
      }
    }

    paintSmoke(delta);
    if (elapsed > 5.55 && !revealStarted) {
      revealStarted = true;
      document.body.classList.remove('intro-active');
      intro.classList.add('clearing');
    }
    if (elapsed > 6.4) {
      smokeCanvas.classList.add('clearing');
    }
    if (elapsed > 7.5) finishSequence();
  };

  const frame = now => {
    if (sequenceRunning) updateSequence(now);
    else if (smokeParticles.length) paintSmoke(Math.min((now - previousTime) / 1000, .05));
    previousTime = now;
    requestAnimationFrame(frame);
  };

  heroVisual?.addEventListener('pointermove', event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    heroVisual.style.setProperty('--hero-x', `${x * 26}px`);
    heroVisual.style.setProperty('--hero-y', `${y * 18}px`);
    heroVisual.style.setProperty('--hero-rotate-y', `${x * 9}deg`);
    heroVisual.style.setProperty('--hero-rotate-x', `${y * -6}deg`);
  });
  heroVisual?.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--hero-x', '0px');
    heroVisual.style.setProperty('--hero-y', '0px');
    heroVisual.style.setProperty('--hero-rotate-y', '0deg');
    heroVisual.style.setProperty('--hero-rotate-x', '0deg');
  });

  let scrollTicking = false;
  const updateScrollMotion = () => {
    const heroProgress = clamp(scrollY / Math.max(innerHeight, 1), 0, 1.35);
    document.documentElement.style.setProperty('--page-scroll', heroProgress.toFixed(3));
    scrollTicking = false;
  };
  addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollMotion);
  }, { passive: true });

  skipIntro.addEventListener('click', finishSequence);
  replayLaunch?.addEventListener('click', startSequence);
  addEventListener('resize', resize);

  resize();
  updateScrollMotion();
  if (reducedMotion) {
    loaderCount.textContent = '100';
    finishSequence();
  } else {
    startSequence();
  }
  requestAnimationFrame(frame);
})();
