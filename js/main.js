(() => {
  'use strict';

  const doc = document;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const canFx = !reduced && !coarse;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const bootTime = performance.now();

  /* ============ PRELOADER ============ */
  function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;
    const fill = $('[data-preloader-fill]', pre);
    const count = $('[data-preloader-count]', pre);
    let pct = 0;
    let ticker = null;

    const hide = () => {
      pre.classList.add('is-hidden');
      setTimeout(() => pre.parentNode && pre.parentNode.removeChild(pre), 450);
    };

    if (reduced) {
      fill.style.width = '100%';
      count.textContent = '100%';
      setTimeout(hide, 100);
      return;
    }

    ticker = setInterval(() => {
      pct = Math.min(100, pct + (2 + Math.random() * 4));
      fill.style.width = pct + '%';
      count.textContent = String(Math.floor(pct)).padStart(2, '0') + '%';
      if (pct >= 100) {
        clearInterval(ticker);
        setTimeout(hide, 200);
      }
    }, 30);

    setTimeout(() => {
      if (pre.isConnected) {
        clearInterval(ticker);
        pct = 100;
        fill.style.width = '100%';
        count.textContent = '100%';
        hide();
      }
    }, 1600);
  }

  /* ============ NAV / PROGRESS / MOBILE MENU ============ */
  function initNav() {
    const nav = $('#navbar');
    if (!nav) return;
    const progress = $('[data-scroll-progress]', nav);
    const toggle = $('#navToggle');
    const menu = $('#mobileMenu');

    const setMenu = (open) => {
      if (!toggle || !menu) return;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      doc.body.style.overflow = open ? 'hidden' : '';
      if (!open) toggle.focus();
    };

    if (toggle && menu) {
      toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
      const closeBtn = $('[data-mobile-close]', menu);
      if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
      $$('[data-mobile-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
      doc.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
      });
    }

    return { nav, progress };
  }

  /* ============ SMOOTH SCROLL + SCROLLSPY ============ */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = doc.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      });
    });

    const links = $$('[data-nav-link]');
    const sections = ['hero', 'about', 'projects', 'experience', 'contact'];
    const updateActive = (id) => {
      links.forEach((l) => {
        const active = l.getAttribute('href') === '#' + id || (id === 'hero' && l.getAttribute('href') === '#home');
        l.classList.toggle('is-active', active);
        if (active) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    };
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) updateActive(en.target.id);
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      sections.forEach((id) => {
        const el = doc.getElementById(id);
        if (el) spy.observe(el);
      });
    } else {
      updateActive('hero');
    }
  }

  /* ============ REVEAL SYSTEM ============ */
  function initReveals() {
    const els = $$('[data-reveal]');
    const setWillChange = (el, on) => {
      if (on) el.style.willChange = 'transform, opacity';
      else el.style.removeProperty('will-change');
    };
    const revealAll = () => {
      els.forEach((el) => {
        el.classList.add('is-revealed');
        el.removeAttribute('aria-hidden');
        el.style.removeProperty('will-change');
      });
    };

    els.forEach((el) => el.setAttribute('aria-hidden', 'true'));

    if (!('IntersectionObserver' in window) || reduced) {
      revealAll();
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-revealed');
        el.removeAttribute('aria-hidden');
        setTimeout(() => setWillChange(el, false), 1200);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -12% 0px' });

    els.forEach((el) => {
      const d = el.getAttribute('data-delay');
      if (d) el.style.setProperty('--reveal-delay', d + 'ms');
      setWillChange(el, true);
      io.observe(el);
    });
  }

  /* ============ SKILL BARS ============ */
  function initBars() {
    const bars = $$('[data-bar]');
    const fill = (el) => {
      const v = clamp(parseInt(el.getAttribute('data-bar'), 10) || 0, 0, 100);
      const f = $('.skill-bar-fill', el);
      if (f) f.style.width = v + '%';
    };
    if (!('IntersectionObserver' in window) || reduced) {
      bars.forEach(fill);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          fill(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach((b) => io.observe(b));
  }

  /* ============ STAT COUNT-UP ============ */
  function initCountUp() {
    const nums = $$('[data-count]');
    const run = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduced) {
        el.textContent = String(target);
        return;
      }
      const t0 = performance.now();
      const dur = 1200;
      const frame = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          run(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });
    nums.forEach((n) => io.observe(n));
  }

  /* ============ TIMELINE ============ */
  function initTimeline() {
    const tl = $('#timeline');
    if (!tl) return {};
    const draw = $('.timeline-draw', tl);
    const nodes = $$('.timeline-node', tl);

    nodes.forEach((n, i) => n.style.setProperty('--node-delay', i * 150 + 'ms'));

    const update = () => {
      if (!draw) return;
      if (reduced) {
        draw.style.transform = 'scaleY(1)';
        return;
      }
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.3 - r.height;
      const p = clamp((start - r.top) / (start - end || 1), 0, 1);
      draw.style.transform = 'scaleY(' + p + ')';
    };

    if (!('IntersectionObserver' in window) || reduced) {
      nodes.forEach((n) => n.classList.add('is-on'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-on');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
      nodes.forEach((n) => io.observe(n));
    }

    return { update };
  }

  /* ============ CURSOR GLOW ============ */
  function initCursor() {
    if (!canFx) return;
    const cur = $('[data-cursor]');
    if (!cur) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx, y = ty, s = 1, ts = 1;

    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      s += (ts - s) * 0.12;
      cur.style.transform =
        'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
      requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cur.style.opacity = '1';
    }, { passive: true });

    const HOT = 'a, button, input, textarea, select, .skill-chip, .project-card, [data-magnetic]';
    doc.addEventListener('pointerover', (e) => {
      const hot = !!(e.target.closest && e.target.closest(HOT));
      ts = hot ? 1.6 : 1;
      cur.classList.toggle('is-hot', hot);
    });

    requestAnimationFrame(loop);
  }

  /* ============ MAGNETIC BUTTONS ============ */
  function initMagnetic() {
    if (!canFx) return;
    $$('[data-magnetic]').forEach((el) => {
      let tx = 0, ty = 0, x = 0, y = 0, raf = null;

      const step = () => {
        x += (tx - x) * 0.3;
        y += (ty - y) * 0.3;
        if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
          x = tx;
          y = ty;
          raf = null;
        } else {
          raf = requestAnimationFrame(step);
        }
        el.style.setProperty('--mx', x.toFixed(2) + 'px');
        el.style.setProperty('--my', y.toFixed(2) + 'px');
      };
      const poke = () => { if (raf === null) raf = requestAnimationFrame(step); };

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        let dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        let dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        const m = Math.hypot(dx, dy);
        if (m > 6) {
          dx = (dx / m) * 6;
          dy = (dy / m) * 6;
        }
        tx = dx;
        ty = dy;
        poke();
      });
      el.addEventListener('mouseleave', () => {
        tx = 0;
        ty = 0;
        poke();
      });
    });
  }

  /* ============ PROJECT CARD TILT ============ */
  function initTilt() {
    if (!canFx) return;
    $$('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (py * -8).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ============ HERO: LOAD / GLITCH / TYPEWRITER / PARALLAX / CANVAS ============ */
  function initHero() {
    const hero = $('#hero');
    if (!hero) return;
    const title = $('.hero-title', hero);
    const stage = $('[data-hero-parallax="stage"]', hero);
    const text = $('[data-hero-parallax="text"]', hero);
    const orbs = $('[data-hero-parallax="orbs"]');

    hero.classList.add('hero-in');

    const glitch = () => {
      if (reduced || !title) return;
      title.classList.remove('is-glitching');
      void title.offsetWidth;
      title.classList.add('is-glitching');
    };
    glitch();

    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) glitch();
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -70% 0px' });
      io.observe(hero);
    }

    const typeEl = $('[data-typewriter]', hero);
    if (typeEl) {
      const textEl = $('[data-type-text]', typeEl);
      const ROLES = ['Software & AI Enthusiast', 'Freelance Developer', 'AI Assistant Builder'];
      if (reduced) {
        textEl.textContent = ROLES[0];
      } else {
        let ri = 0, ci = 0, deleting = false;
        const tick = () => {
          const word = ROLES[ri];
          if (!deleting) {
            ci += 1;
            textEl.textContent = word.slice(0, ci);
            if (ci === word.length) {
              deleting = true;
              setTimeout(tick, 1800);
            } else {
              setTimeout(tick, 55 + Math.random() * 60);
            }
          } else {
            ci -= 1;
            textEl.textContent = word.slice(0, ci);
            if (ci === 0) {
              deleting = false;
              ri = (ri + 1) % ROLES.length;
              setTimeout(tick, 350);
            } else {
              setTimeout(tick, 30);
            }
          }
        };
        setTimeout(tick, 1500);
      }
    }

    const parallaxUpdate = () => {
      if (reduced || window.innerWidth < 1024) return;
      if (performance.now() - bootTime < 1600) return;
      const y = window.scrollY || window.pageYOffset;
      if (text) text.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(2) + 'px,0)';
      if (stage) {
        stage.style.animation = 'none';
        stage.style.transform = 'translate3d(0,' + Math.min(y * 0.2, 200).toFixed(2) + 'px,0)';
      }
      if (orbs) orbs.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(2) + 'px,0)';
    };

    return { parallaxUpdate };
  }

  /* ============ HERO CANVAS (Three.js via importmap) ============ */
  async function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    try {
      const mod = await import('./js/hero-scene.js');
      const cleanup = await mod.initHeroScene(canvas);
      window.heroCleanup = typeof cleanup === 'function' ? cleanup : function () {};
    } catch (err) {
      console.warn('Hero scene unavailable:', err);
      canvas.remove();
    }
  }

  /* ============ CONTACT FORM ============ */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const success = $('[data-form-success]');
    const status = $('[data-form-status]', form);
    const fields = {
      name: $('#field-name', form),
      email: $('#field-email', form),
      message: $('#field-message', form)
    };
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rules = {
      name: (v) => (v.trim() ? '' : 'Please enter your name.'),
      email: (v) => (emailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'),
      message: (v) => (v.trim() ? '' : 'Please add a message.')
    };
    const okText = { name: 'Looks good.', email: 'Looks good.', message: 'Looks good.' };

    const setState = (field, state, msg) => {
      const wrap = field.closest('.field');
      wrap.classList.toggle('is-error', state === 'error');
      wrap.classList.toggle('is-valid', state === 'valid');
      field.setAttribute('aria-invalid', state === 'error' ? 'true' : 'false');
      const box = $('[data-msg]', wrap);
      if (box) {
        $('.msg-icon', box).textContent = state === 'error' ? '!' : state === 'valid' ? '✓' : '';
        $('[data-msg-text]', box).textContent = msg || '';
      }
    };

    const validate = (key) => {
      const msg = rules[key](fields[key].value);
      setState(fields[key], msg ? 'error' : 'valid', msg || okText[key]);
      return !msg;
    };

    ['name', 'email', 'message'].forEach((key) => {
      fields[key].addEventListener('blur', () => {
        if (fields[key].value.trim()) validate(key);
      });
      fields[key].addEventListener('input', () => {
        const wrap = fields[key].closest('.field');
        if (wrap.classList.contains('is-error') || wrap.classList.contains('is-valid')) validate(key);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const keys = ['name', 'email', 'message'];
      const results = keys.map(validate);
      if (results.every(Boolean)) {
        status.textContent = 'Message sent — thanks for reaching out!';
        if (success) success.hidden = false;
        form.hidden = true;
      } else {
        status.textContent = 'Please fix the highlighted fields.';
        status.style.color = 'var(--accent-magenta)';
        const first = keys.find((k, i) => !results[i]);
        if (first && fields[first]) fields[first].focus();
      }
    });

    const resetBtn = $('[data-form-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        ['name', 'email', 'message'].forEach((key) => {
          setState(fields[key], 'idle', '');
          fields[key].setAttribute('aria-invalid', 'false');
        });
        status.textContent = '';
        status.style.color = '';
        form.hidden = false;
        if (success) success.hidden = true;
      });
    }
  }

  /* ============ BOOT ============ */
  function boot() {
    initPreloader();
    const navApi = initNav() || {};
    initAnchors();
    initReveals();
    initBars();
    initCountUp();
    const timeline = initTimeline();
    initCursor();
    initMagnetic();
    initTilt();
    const hero = initHero() || {};
    initForm();
    initHeroCanvas();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        if (navApi.nav) navApi.nav.classList.toggle('is-scrolled', y > 40);
        if (navApi.progress) {
          const max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
          navApi.progress.style.width = clamp((y / max) * 100, 0, 100) + '%';
        }
        if (timeline.update) timeline.update();
        if (hero.parallaxUpdate) hero.parallaxUpdate();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();