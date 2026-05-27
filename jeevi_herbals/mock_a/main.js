/**
 * Jeevi Herbals - Jungle Book Edition Client-side Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initHeroAnimations();
  initConcernFilter();
  initTestimonialSlider();
  initScrollAnimationsFallback();
  initLeafFall();
  initJungleParallax();
});

/**
 * 1. Sticky Header Control
 */
function initStickyHeader() {
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
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
 * 3. Hero Word Stagger Delay
 */
function initHeroAnimations() {
  const titleSpans = document.querySelectorAll('#heroTitle span');
  titleSpans.forEach((span, index) => {
    span.style.animationDelay = `${index * 0.18}s`;
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
    card.style.transition = 'opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1), transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
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
          void card.offsetWidth; // Force Reflow
          
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.style.pointerEvents = 'auto';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.96)';
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
 * 5. Testimonial Slider / Carousel
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
    autoPlayInterval = setInterval(nextSlide, 7000);
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
 * 6. Progressive Enhancement: Scroll-Driven Reveal Fallback
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
    el.style.transform = 'translateY(35px)';
    revealObserver.observe(el);
  });
}

/**
 * 7. Leaf Fall Particle Canvas Simulation
 */
function initLeafFall() {
  const canvas = document.getElementById('leafCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return;

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const leafCount = 18;
  const leaves = [];
  const leafColors = [
    'rgba(28, 64, 44, 0.4)',  // Deep Jungle Leaf
    'rgba(74, 117, 89, 0.35)', // Mid Moss Leaf
    'rgba(197, 168, 128, 0.25)', // Muted Golden Leaf
    'rgba(243, 166, 40, 0.2)'  // Translucent Amber Leaf
  ];

  class Leaf {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Distribute on first load
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -30;
      this.size = Math.random() * 8 + 8; // Size 8px to 16px radius
      this.speedY = Math.random() * 0.8 + 0.6; // Fall rate
      this.speedX = Math.random() * 0.4 - 0.2; // Side drift
      this.color = leafColors[Math.floor(Math.random() * leafColors.length)];
      this.angle = Math.random() * 360;
      this.spin = Math.random() * 0.6 - 0.3; // Spin rate
      this.sway = Math.random() * 10;
      this.swaySpeed = Math.random() * 0.02 + 0.015;
    }

    update() {
      this.y += this.speedY;
      this.sway += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.sway) * 0.4;
      this.angle += this.spin;

      // Reset when off-screen
      if (this.y > canvas.height + 30 || this.x < -30 || this.x > canvas.width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.fillStyle = this.color;
      
      // Draw double-arc leaf
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stem line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(this.size, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Floating Fireflies (Glowing Amber Dots)
  const fireflyCount = 25;
  const fireflies = [];
  const fireflyColors = [
    'rgba(243, 166, 40, ', // Gold
    'rgba(180, 240, 60, ', // Lime-gold
    'rgba(220, 190, 80, '  // Warm amber
  ];

  class Firefly {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Distribute across height on load
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1; // 1px to 3px radius
      this.speedX = Math.random() * 0.4 - 0.2; // Gentle random horizontal drift
      this.speedY = Math.random() * 0.4 - 0.2; // Gentle random vertical drift
      this.colorBase = fireflyColors[Math.floor(Math.random() * fireflyColors.length)];
      this.alpha = Math.random();
      this.fadeSpeed = 0.006 + Math.random() * 0.012;
      if (Math.random() > 0.5) this.fadeSpeed = -this.fadeSpeed;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha += this.fadeSpeed;

      if (this.alpha > 1) {
        this.alpha = 1;
        this.fadeSpeed = -this.fadeSpeed;
      } else if (this.alpha < 0) {
        this.alpha = 0;
        this.fadeSpeed = -this.fadeSpeed;
      }

      // Border wrap-around
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.alpha + ')';
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = this.colorBase.replace(', ', '') + ')';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }

  for (let i = 0; i < fireflyCount; i++) {
    fireflies.push(new Firefly());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw leaves
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw();
    });

    // Draw fireflies
    fireflies.forEach(firefly => {
      firefly.update();
      firefly.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  mediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}

/**
 * 8. Interactive Mouse-Move Parallax on Hero Image
 */
function initJungleParallax() {
  const hero = document.querySelector('.hero');
  const imgWrapper = document.querySelector('.hero-image-wrapper');
  if (!hero || !imgWrapper) return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return;

  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = hero.getBoundingClientRect();
    
    // Displacements relative to center of container
    const xRatio = (clientX - left) / width - 0.5;
    const yRatio = (clientY - top) / height - 0.5;

    // Translate slightly (max 10px each side)
    const moveX = xRatio * 20;
    const moveY = yRatio * 20;

    imgWrapper.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  });

  hero.addEventListener('mouseleave', () => {
    imgWrapper.style.transform = 'translate3d(0, 0, 0)';
    imgWrapper.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
  });
  
  hero.addEventListener('mouseenter', () => {
    imgWrapper.style.transition = 'none'; // Instant response when mouse enters
  });
}
