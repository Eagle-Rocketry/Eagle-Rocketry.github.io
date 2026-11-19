(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('#site-nav');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      navigation.classList.toggle('open', !open);
    });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
    }));
  }

  document.querySelectorAll('[data-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  const revealNodes = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .12 });
    revealNodes.forEach(node => observer.observe(node));
  } else {
    revealNodes.forEach(node => node.classList.add('visible'));
  }

  document.querySelectorAll('[data-diagram-viewer]').forEach(viewer => {
    const stage = viewer.querySelector('.diagram-stage');
    const image = viewer.querySelector('.zoom-diagram');
    const readout = viewer.querySelector('[data-zoom-readout]');
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;

    const render = () => {
      image.style.transform = `translate3d(${offsetX}px,${offsetY}px,0) scale(${scale})`;
      if (readout) readout.textContent = `${Math.round(scale * 100)}%`;
      stage.classList.toggle('is-zoomed', scale > 1);
    };

    const setScale = nextScale => {
      scale = Math.max(1, Math.min(3.5, nextScale));
      if (scale === 1) offsetX = offsetY = 0;
      render();
    };

    viewer.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.zoom;
      if (action === 'in') setScale(scale + .35);
      if (action === 'out') setScale(scale - .35);
      if (action === 'reset') {
        offsetX = offsetY = 0;
        setScale(1);
      }
    }));

    stage.addEventListener('wheel', event => {
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? .2 : -.2));
    }, { passive: false });

    stage.addEventListener('pointerdown', event => {
      if (scale === 1) return;
      dragging = true;
      startX = event.clientX - offsetX;
      startY = event.clientY - offsetY;
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove', event => {
      if (!dragging) return;
      offsetX = event.clientX - startX;
      offsetY = event.clientY - startY;
      render();
    });
    stage.addEventListener('pointerup', () => { dragging = false; });
    stage.addEventListener('pointercancel', () => { dragging = false; });
    render();
  });

  const progress = document.querySelector('.page-progress span');
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - innerHeight;
    const amount = available > 0 ? scrollY / available : 0;
    if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, amount))})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();
