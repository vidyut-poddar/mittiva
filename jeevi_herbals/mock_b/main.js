/**
 * Jeevi Herbals - Mock B (Classical Cartoon Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initHeroAnimations();
  initConcernFilter();
  initTestimonialSlider();
  initScrollAnimationsFallback();
  initBirdSpawner();
  initDeerTrigger();
  initFireflies();
  initPredatorEyes();
  initParallax();
});

/**
 * 1. Sticky Header
 */
function initStickyHeader() {
  const topnav = document.getElementById('topnav');
  if (!topnav) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      topnav.classList.add('scrolled');
    } else {
      topnav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Mobile Menu Toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.textContent = '☰';
    });
  });
}

/**
 * 3. Hero Title Word Stagger
 */
function initHeroAnimations() {
  const titleSpans = document.querySelectorAll('#heroTitle span');
  titleSpans.forEach((span, index) => {
    span.style.animationDelay = `${index * 0.16}s`;
  });
}

/**
 * 4. Concern Filter Interaction
 */
function initConcernFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  
  if (filterButtons.length === 0 || productCards.length === 0) return;

  productCards.forEach(card => {
    card.style.transition = 'opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'translateY(0) scale(1)';
    card.style.opacity = '1';
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      productCards.forEach(card => {
        const concerns = card.getAttribute('data-concerns').split(' ');

        if (filter === 'all' || concerns.includes(filter)) {
          card.style.display = 'flex';
          void card.offsetWidth; // Reflow
          
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.style.pointerEvents = 'auto';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.97)';
          card.style.pointerEvents = 'none';

          const onTransitionEnd = (event) => {
            if (event.propertyName === 'opacity' && card.style.opacity === '0') {
              card.style.display = 'none';
              card.removeEventListener('transitionend', onTransitionEnd);
            }
          };
          card.addEventListener('transitionend', onTransitionEnd);
        }
      });
    });
  });
}

/**
 * 5. Testimonials Carousel
 */
function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const btnPrev = document.getElementById('prevTestimonial');
  const btnNext = document.getElementById('nextTestimonial');
  
  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoPlayInterval = null;

  const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides[currentSlide].classList.add('active');
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  const startAutoPlay = () => {
    autoPlayInterval = setInterval(nextSlide, 6500);
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  };

  if (btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });

    btnPrev.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  startAutoPlay();
}

/**
 * 6. Progressive Scroll Fallback reveals
 */
function initScrollAnimationsFallback() {
  const supportsScrollTimeline = 
    CSS.supports('animation-timeline', 'scroll()') && 
    CSS.supports('animation-range', '0% 100%');

  if (supportsScrollTimeline) return; 

  const revealElements = document.querySelectorAll('.scroll-fade-in');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.transition = 'opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    revealObserver.observe(el);
  });
}

/**
 * 7. Bird Spawner (Dynamic SVG flying birds)
 */
function initBirdSpawner() {
  const container = document.getElementById('birdContainer');
  if (!container) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // Detailed vector cartoon bird with flapping wings
  const birdInner = `
    <div class="bird-svg-wrap">
      <svg viewBox="0 0 100 80" class="bird-svg" style="width: 100%; height: 100%;">
        <!-- Left Wing (behind body) -->
        <g class="wing-left">
          <path d="M 45 40 C 30 20, 20 25, 25 45 C 30 55, 40 50, 45 40 Z" fill="#2a82c9" />
          <path d="M 40 38 C 30 22, 25 28, 28 42 Z" fill="#ffd43f" />
        </g>
        <!-- Tail Feathers -->
        <path d="M 35 55 C 20 65, 15 60, 20 50 Z" fill="#2a82c9" />
        <path d="M 30 58 C 18 68, 15 65, 18 55 Z" fill="#ffd43f" />
        <!-- Body -->
        <circle cx="55" cy="48" r="22" fill="#3598db" /> <!-- Main blue body -->
        <ellipse cx="60" cy="54" rx="14" ry="12" fill="#ffd43f" /> <!-- Yellow belly -->
        <!-- Head / Face Details -->
        <circle cx="65" cy="38" r="16" fill="#3598db" />
        <!-- Eyes: Big Disney style -->
        <circle cx="70" cy="34" r="5.5" fill="#ffffff" />
        <circle cx="71" cy="34" r="3" fill="#2c3e50" />
        <circle cx="72.5" cy="32.5" r="1" fill="#ffffff" />
        <!-- Beak -->
        <path d="M 78 36 Q 86 38 78 44 Z" fill="#e67e22" />
        <!-- Rosy Cheek -->
        <circle cx="63" cy="42" r="3.5" fill="#ff7675" opacity="0.6" />
        <!-- Right Wing (in front of body) -->
        <g class="wing-right">
          <path d="M 55 45 C 45 25, 35 30, 40 50 C 45 60, 50 55, 55 45 Z" fill="#3598db" />
          <path d="M 52 42 C 45 28, 38 32, 42 47 Z" fill="#ffd43f" />
        </g>
      </svg>
    </div>
  `;

  const spawnBird = () => {
    const bird = document.createElement('div');
    bird.className = 'flying-bird';
    bird.innerHTML = birdInner;

    const direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
    const topPercent = Math.random() * 30 + 8; // 8% to 38% height
    const scale = Math.random() * 0.4 + 0.6; // 0.6x to 1.0x
    const speed = Math.random() * 4 + 10; // 10s to 14s glide

    bird.style.top = `${topPercent}vh`;
    bird.style.setProperty('--s', scale);
    bird.style.animationDuration = `${speed}s`;

    if (direction === 'ltr') {
      bird.classList.add('bird-glide-ltr');
    } else {
      bird.classList.add('bird-glide-rtl');
    }

    container.appendChild(bird);

    // Auto delete after animation finishes to prevent DOM footprint leaks
    bird.addEventListener('animationend', () => {
      bird.remove();
    });
  };

  // Spawning loops
  setTimeout(spawnBird, 1500);
  setTimeout(spawnBird, 5000);

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      spawnBird();
    }
  }, 5000);
}

/**
 * 8. Hopping Deer Random Rest Interval
 */
function initDeerTrigger() {
  const deer = document.getElementById('hoppingDeer');
  if (!deer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // Let deer animation default loop, but we can randomize run timing by resetting keyframe
  const triggerDeerRun = () => {
    // Reset classes to trigger re-flow animation
    deer.style.animation = 'none';
    void deer.offsetWidth;
    
    const randomDuration = Math.random() * 4 + 12; // 12s to 16s
    deer.style.animation = `deerRun ${randomDuration}s linear forwards`;
  };

  deer.addEventListener('animationend', () => {
    // Wait random time before run again
    const waitTime = Math.random() * 10000 + 15000; // 15s to 25s
    setTimeout(triggerDeerRun, waitTime);
  });

  // Initial trigger
  triggerDeerRun();
}

/**
 * 9. Floating Fireflies Canvas Emitter
 */
function initFireflies() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fireflyCanvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '3';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const fireflies = [];
  const count = 35;

  for (let i = 0; i < count; i++) {
    fireflies.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      alpha: Math.random(),
      fadeSpeed: (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1)
    });
  }

  function animate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ctx.clearRect(0, 0, width, height);

    fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.alpha += f.fadeSpeed;

      if (f.alpha > 1) {
        f.alpha = 1;
        f.fadeSpeed = -f.fadeSpeed;
      } else if (f.alpha < 0) {
        f.alpha = 0;
        f.fadeSpeed = -f.fadeSpeed;
      }

      // Screen wrapping
      if (f.x < 0) f.x = width;
      if (f.x > width) f.x = 0;
      if (f.y < 0) f.y = height;
      if (f.y > height) f.y = 0;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 230, 80, ${f.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(196, 230, 80, 0.8)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/**
 * 10. Blinking Predator Eyes in the Dark Margins
 */
function initPredatorEyes() {
  const container = document.querySelector('.predator-eyes-container');
  if (!container) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const eyeColors = ['#ffd32a', '#ff5e57', '#0be881', '#ffc048'];

  const spawnEyes = () => {
    if (document.visibilityState !== 'visible') return;
    
    const eyes = document.createElement('div');
    eyes.className = 'predator-eyes';
    
    const eyeL = document.createElement('div');
    eyeL.className = 'predator-eye';
    const eyeR = document.createElement('div');
    eyeR.className = 'predator-eye';

    eyes.appendChild(eyeL);
    eyes.appendChild(eyeR);

    const side = Math.random() > 0.5 ? 'left' : 'right';
    const top = Math.random() * 80 + 10;
    const color = eyeColors[Math.floor(Math.random() * eyeColors.length)];

    eyes.style.top = `${top}vh`;
    eyes.style.setProperty('--eye-color', color);
    
    if (side === 'left') {
      eyes.style.left = `${Math.random() * 6 + 2}vw`;
    } else {
      eyes.style.right = `${Math.random() * 8 + 8}vw`;
    }

    container.appendChild(eyes);

    eyes.addEventListener('animationend', () => {
      eyes.remove();
    });
  };

  const triggerNextSpawn = () => {
    const delay = Math.random() * 5000 + 7000;
    setTimeout(() => {
      spawnEyes();
      triggerNextSpawn();
    }, delay);
  };

  setTimeout(spawnEyes, 4000);
  triggerNextSpawn();
}

/**
 * 11. 3D Scroll Parallax Effect
 */
function initParallax() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const jungleScene = document.querySelector('.jungle-scene');
  const canopy = document.querySelector('.canopy-leaves');
  const borderL = document.querySelector('.jungle-border-left');
  const borderR = document.querySelector('.jungle-border-right');
  const kaa = document.querySelector('.kaa-container');
  const bagheera = document.querySelector('.bagheera-container');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Background scrolls slowly
    if (jungleScene) {
      jungleScene.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
    }

    // Foreground canopy scrolls slightly faster in reverse, creating depth
    if (canopy) {
      canopy.style.transform = `translate3d(0, ${scrollY * -0.06}px, 0)`;
    }

    // Border trees move slightly, enhancing vertical depth
    if (borderL) {
      borderL.style.transform = `translate3d(0, ${scrollY * 0.04}px, 0)`;
    }
    if (borderR) {
      borderR.style.transform = `translate3d(0, ${scrollY * 0.04}px, 0)`;
    }

    // Cameos translate with their respective background structures
    if (kaa) {
      kaa.style.transform = `translate3d(0, ${scrollY * 0.04}px, 0)`;
    }
    if (bagheera) {
      bagheera.style.transform = `translate3d(0, ${scrollY * -0.06}px, 0)`;
    }
  }, { passive: true });
}
