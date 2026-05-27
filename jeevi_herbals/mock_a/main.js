/**
 * Jeevi Herbals - Jungle Book Edition Client-side Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initHeroAnimations();
  initConsultationWizard();
  initTestimonialSlider();
  initScrollAnimationsFallback();
  initLeafFall();
  initJungleParallax();
  initTimeBasedAmbiance();
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
 * 4. Ayurvedic Consultation Wizard
 */
function initConsultationWizard() {
  const wizard = document.getElementById('consultationWizard');
  if (!wizard) return;

  let currentStep = 1;
  let selectedPath = null; // 'skin' or 'hair'

  const steps = wizard.querySelectorAll('.wizard-step');
  const pathButtons = wizard.querySelectorAll('.path-card-btn');
  const skinSelector = document.getElementById('skinSymptomSelector');
  const hairSelector = document.getElementById('hairSymptomSelector');
  const skinCheckboxes = wizard.querySelectorAll('input[name="skin-symptom"]');
  const hairCheckboxes = wizard.querySelectorAll('input[name="hair-symptom"]');
  const btnStep2Next = document.getElementById('btnStep2Next');
  const concernDescription = document.getElementById('concernDescription');
  const charCount = document.getElementById('charCount');
  const btnWizardSubmit = document.getElementById('btnWizardSubmit');
  const btnRestartWizard = document.getElementById('btnRestartWizard');
  
  // Results Elements
  const diagnosedDosha = document.getElementById('diagnosedDosha');
  const diagnosisSummaryText = document.getElementById('diagnosisSummaryText');
  const userTypedSummary = document.getElementById('userTypedSummary');
  const recommendedIngredients = document.getElementById('recommendedIngredients');

  // Mapping rules for Ayurvedic analysis
  const SYMPTOM_RULES = {
    // Skin concerns
    acne: { dosha: 'Pitta', weight: 2, secondaryDosha: 'Kapha', botanicals: ['Kuppaimeni', 'Kasthuri Manjal'] },
    dullness: { dosha: 'Kapha', weight: 2, secondaryDosha: 'Kapha', botanicals: ['Multani Mitti', 'Kasthuri Manjal'] },
    pigmentation: { dosha: 'Pitta', weight: 2, secondaryDosha: 'Vata', botanicals: ['Kasthuri Manjal', 'Vetiver Root'] },
    'dark-circles': { dosha: 'Vata', weight: 2, secondaryDosha: 'Pitta', botanicals: ['Vetiver Root'] },
    dryness: { dosha: 'Vata', weight: 2, secondaryDosha: 'Vata', botanicals: ['Vetiver Root', 'Karuppu Kavuni'] },
    
    // Hair concerns
    'hair-growth': { dosha: 'Pitta', weight: 2, secondaryDosha: 'Vata', botanicals: ['Karuppu Kavuni', 'Vetiver Root'] },
    'frizzy-hair': { dosha: 'Vata', weight: 2, secondaryDosha: 'Vata', botanicals: ['Vetiver Root', 'Karuppu Kavuni'] },
    'damaged-hair': { dosha: 'Vata', weight: 2, secondaryDosha: 'Pitta', botanicals: ['Vetiver Root'] },
    dandruff: { dosha: 'Kapha', weight: 2, secondaryDosha: 'Kapha', botanicals: ['Kuppaimeni', 'Vetiver Root'] }
  };

  const BOTANICAL_DETAILS = {
    'Vetiver Root': { icon: '🌾', role: 'Hydrating & Cooling' },
    'Multani Mitti': { icon: '🧱', role: 'Purifying & Oil-control' },
    'Kasthuri Manjal': { icon: '🍠', role: 'Blemish-clearing & Glowing' },
    'Karuppu Kavuni': { icon: '🌾', role: 'Nourishing & Follicle-strengthening' },
    'Kuppaimeni': { icon: '🌱', role: 'Soothing & Antibacterial' }
  };

  function showStep(stepNum) {
    currentStep = stepNum;
    steps.forEach(step => {
      const stepVal = parseInt(step.getAttribute('data-step'), 10);
      if (stepVal === stepNum) {
        step.style.display = 'flex';
        // Force Reflow
        void step.offsetWidth;
        step.classList.add('active');
      } else {
        step.classList.remove('active');
        step.style.display = 'none';
      }
    });

    // Scroll wizard into view if user navigates steps
    const wizardTop = wizard.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(window.scrollY - (wizardTop - 120)) > 300) {
      window.scrollTo({
        top: wizardTop - 120,
        behavior: 'smooth'
      });
    }
  }

  // Step 1: Pathway selection
  pathButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedPath = btn.getAttribute('data-path');
      
      // Reset checkboxes
      skinCheckboxes.forEach(cb => cb.checked = false);
      hairCheckboxes.forEach(cb => cb.checked = false);
      btnStep2Next.disabled = true;

      if (selectedPath === 'skin') {
        skinSelector.style.display = 'flex';
        hairSelector.style.display = 'none';
      } else {
        skinSelector.style.display = 'none';
        hairSelector.style.display = 'flex';
      }

      showStep(2);
    });
  });

  // Step 2: Checkbox verification
  const validateStep2 = () => {
    const activeCheckboxes = selectedPath === 'skin' ? skinCheckboxes : hairCheckboxes;
    const checkedCount = Array.from(activeCheckboxes).filter(cb => cb.checked).length;
    btnStep2Next.disabled = checkedCount === 0;
  };

  skinCheckboxes.forEach(cb => cb.addEventListener('change', validateStep2));
  hairCheckboxes.forEach(cb => cb.addEventListener('change', validateStep2));

  btnStep2Next.addEventListener('click', () => {
    showStep(3);
  });

  // Step 3: Textarea handler
  concernDescription.addEventListener('input', () => {
    const len = concernDescription.value.length;
    charCount.textContent = len;
  });

  // Wizard Back Buttons
  const backButtons = wizard.querySelectorAll('.btn-wizard-back');
  backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showStep(currentStep - 1);
    });
  });

  // Submit diagnosis logic
  btnWizardSubmit.addEventListener('click', () => {
    const activeCheckboxes = selectedPath === 'skin' ? skinCheckboxes : hairCheckboxes;
    const selectedSymptoms = Array.from(activeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedSymptoms.length === 0) {
      alert('Please select at least one concern.');
      showStep(2);
      return;
    }

    // Matchmaking Algorithm
    let doshaScores = { Vata: 0, Pitta: 0, Kapha: 0 };
    let recBotanicalsSet = new Set();

    selectedSymptoms.forEach(sym => {
      const rule = SYMPTOM_RULES[sym];
      if (rule) {
        doshaScores[rule.dosha] += rule.weight;
        if (rule.secondaryDosha && rule.secondaryDosha !== rule.dosha) {
          doshaScores[rule.secondaryDosha] += 1;
        }
        rule.botanicals.forEach(bot => recBotanicalsSet.add(bot));
      }
    });

    // Sort doshas to find top two
    const sortedDoshas = Object.keys(doshaScores).sort((a, b) => doshaScores[b] - doshaScores[a]);
    const primaryDosha = sortedDoshas[0];
    const secondaryDosha = sortedDoshas[1];

    let finalProfileName = '';
    let explanation = '';

    if (doshaScores[primaryDosha] > 0 && doshaScores[secondaryDosha] > 0 && primaryDosha !== secondaryDosha) {
      finalProfileName = `${primaryDosha}-${secondaryDosha} Profile`;
      
      // Dynamic combined descriptions
      if ((primaryDosha === 'Vata' && secondaryDosha === 'Pitta') || (primaryDosha === 'Pitta' && secondaryDosha === 'Vata')) {
        explanation = `Your diagnostic assessment points to a Vata-Pitta dual profile. Governed by air, ether, and fire, this dual state represents dry or dehydrated tissues accompanied by sensitivity or localized heat (like dryness with occasional breakouts or scalp irritation). We recommend a cooling, calming, and deeply hydrating ritual to pacify both elements simultaneously.`;
      } else if ((primaryDosha === 'Pitta' && secondaryDosha === 'Kapha') || (primaryDosha === 'Kapha' && secondaryDosha === 'Pitta')) {
        explanation = `Your diagnostic assessment points to a Pitta-Kapha dual profile. Governed by fire, water, and earth, this state shows a blend of tissue congestion, excess sebum, and active inflammation or redness. To restore balance, it is vital to use lightweight, soothing, and clarifying wild botanicals that clear blockages without aggravating sensitivity.`;
      } else {
        // Vata-Kapha
        explanation = `Your diagnostic assessment points to a Vata-Kapha dual profile. Governed by air, ether, earth, and water, this state represents cool, sluggish circulation paired with fluctuating hydration (dryness alongside congestion or dandruff). We recommend stimulating, warming, and nutrient-rich forest herbs to wake up the tissues and balance moisture.`;
      }
    } else {
      finalProfileName = `${primaryDosha} Dominant Profile`;
      if (primaryDosha === 'Vata') {
        explanation = `Your diagnostic assessment indicates a Vata-dominant state. Governing air and ether, Vata brings dryness, coldness, and lightness. In your skin or hair, this manifests as dehydration, fine flaking, frizz, or brittle strands. To restore grounding harmony, we recommend deep moisturizing and warming botanicals that seal in hydration.`;
      } else if (primaryDosha === 'Pitta') {
        explanation = `Your diagnostic assessment indicates a Pitta-dominant state. Governing fire and water, Pitta manifests as heat, intensity, and active inflammation. In your skin or hair, this translates to acne, redness, heat-induced sensitivity, or hair thinning. To restore soothing coolness, we suggest anti-inflammatory and heat-pacifying forest herbs.`;
      } else {
        explanation = `Your diagnostic assessment indicates a Kapha-dominant state. Governing earth and water, Kapha brings stability, coolness, and moisture. An excess leads to stagnation, congestion, and oily build-up. In your skin or hair, this manifests as clogged pores, dullness, or a heavy, dandruff-prone scalp. We recommend clarifying and stimulating herbs to restore flow.`;
      }
    }

    // Set text contents
    diagnosedDosha.textContent = finalProfileName;
    diagnosisSummaryText.textContent = explanation;
    
    // User notes escaping & display
    const rawUserNotes = concernDescription.value.trim();
    if (rawUserNotes) {
      const div = document.createElement('div');
      div.textContent = `"${rawUserNotes}"`;
      userTypedSummary.innerHTML = div.innerHTML;
      userTypedSummary.parentElement.style.display = 'block';
    } else {
      userTypedSummary.parentElement.style.display = 'none';
    }

    // Render recommended botanicals
    recommendedIngredients.innerHTML = '';
    recBotanicalsSet.forEach(bot => {
      const details = BOTANICAL_DETAILS[bot] || { icon: '🍃', role: 'Balancing Herb' };
      const itemHtml = `
        <div class="rec-ing-item">
          <div class="rec-ing-icon">${details.icon}</div>
          <div class="rec-ing-details">
            <span class="rec-ing-name">${bot}</span>
            <span class="rec-ing-role">${details.role}</span>
          </div>
        </div>
      `;
      recommendedIngredients.insertAdjacentHTML('beforeend', itemHtml);
    });

    showStep(4);
  });

  // Restart / Reset functionality
  btnRestartWizard.addEventListener('click', () => {
    selectedPath = null;
    skinCheckboxes.forEach(cb => cb.checked = false);
    hairCheckboxes.forEach(cb => cb.checked = false);
    btnStep2Next.disabled = true;
    concernDescription.value = '';
    charCount.textContent = '0';
    showStep(1);
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
  const maxFireflies = 45;
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

    draw(maxAlpha = 1.0, sizeMultiplier = 1.0) {
      ctx.save();
      ctx.beginPath();
      const currentAlpha = Math.min(this.alpha, maxAlpha);
      ctx.arc(this.x, this.y, this.size * sizeMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + currentAlpha + ')';
      ctx.shadowBlur = this.size * sizeMultiplier * 3;
      ctx.shadowColor = this.colorBase.replace(', ', '') + ')';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }

  for (let i = 0; i < maxFireflies; i++) {
    fireflies.push(new Firefly());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw leaves
    leaves.forEach(leaf => {
      leaf.update();
      leaf.draw();
    });

    // Dynamic firefly behavior based on ambient phase class on body
    const getAmbientParams = () => {
      const bodyClass = document.body.className;
      if (bodyClass.includes('ambient-night-late')) {
        return { count: 38, maxAlpha: 0.95, sizeMultiplier: 1.25 };
      } else if (bodyClass.includes('ambient-night-early')) {
        return { count: 32, maxAlpha: 0.85, sizeMultiplier: 1.15 };
      } else if (bodyClass.includes('ambient-evening')) {
        return { count: 24, maxAlpha: 0.70, sizeMultiplier: 1.0 };
      } else if (bodyClass.includes('ambient-morning')) {
        return { count: 12, maxAlpha: 0.40, sizeMultiplier: 0.8 };
      } else { // Afternoon
        return { count: 4, maxAlpha: 0.15, sizeMultiplier: 0.65 };
      }
    };

    const params = getAmbientParams();
    for (let i = 0; i < params.count; i++) {
      fireflies[i].update();
      fireflies[i].draw(params.maxAlpha, params.sizeMultiplier);
    }

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

/**
 * 9. Time-Based Ambience Engine & Testing Control Panel
 */
function initTimeBasedAmbiance() {
  const badge = document.getElementById('ambientBadge');
  const badgeIcon = badge ? badge.querySelector('.ambient-icon') : null;
  const badgeText = badge ? badge.querySelector('.ambient-text') : null;

  // Control Panel Elements
  const panel = document.getElementById('ambientControlPanel');
  const toggleBtn = document.getElementById('panelToggleBtn');
  const syncCheckbox = document.getElementById('syncTimeCheckbox');
  const phaseBtns = document.querySelectorAll('.phase-select-btn');
  const demoBtn = document.getElementById('btnDemoCycle');

  let cycleInterval = null;
  let isManualMode = false;

  const PHASES = {
    NIGHT_LATE: {
      className: 'ambient-night-late',
      emoji: '🌑',
      text: 'Ratri (रात्रि)',
      startHour: 23,
      startMin: 0,
      endHour: 5,
      endMin: 30
    },
    MORNING: {
      className: 'ambient-morning',
      emoji: '🌅',
      text: 'Subah (सुबह)',
      startHour: 5,
      startMin: 30,
      endHour: 12,
      endMin: 0
    },
    AFTERNOON: {
      className: 'ambient-afternoon',
      emoji: '☀️',
      text: 'Dopahar (दोपहर)',
      startHour: 12,
      startMin: 0,
      endHour: 16,
      endMin: 0
    },
    EVENING: {
      className: 'ambient-evening',
      emoji: '🌇',
      text: 'Shaam (शाम)',
      startHour: 16,
      startMin: 0,
      endHour: 19,
      endMin: 30
    },
    NIGHT_EARLY: {
      className: 'ambient-night-early',
      emoji: '🌙',
      text: 'Raat (रात)',
      startHour: 19,
      startMin: 30,
      endHour: 23,
      endMin: 0
    }
  };

  const getMinutesSinceMidnight = (hours, minutes) => {
    return hours * 60 + minutes;
  };

  const getCurrentPhase = () => {
    const now = new Date();
    const currentMins = getMinutesSinceMidnight(now.getHours(), now.getMinutes());

    for (const key in PHASES) {
      const phase = PHASES[key];
      const startMins = getMinutesSinceMidnight(phase.startHour, phase.startMin);
      const endMins = getMinutesSinceMidnight(phase.endHour, phase.endMin);

      if (startMins < endMins) {
        if (currentMins >= startMins && currentMins < endMins) {
          return phase;
        }
      } else {
        if (currentMins >= startMins || currentMins < endMins) {
          return phase;
        }
      }
    }
    return PHASES.MORNING;
  };

  // Set visual phase
  const setPhase = (phaseConfig) => {
    // Remove other phase classes
    for (const key in PHASES) {
      document.body.classList.remove(PHASES[key].className);
    }
    
    // Add active phase class
    document.body.classList.add(phaseConfig.className);

    // Update Header Badge
    if (badgeIcon && badgeText) {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(4px)';
      
      setTimeout(() => {
        badgeIcon.textContent = phaseConfig.emoji;
        badgeText.textContent = phaseConfig.text;
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
      }, 400);
    }

    // Update Control Panel buttons highlight
    phaseBtns.forEach(btn => {
      if (btn.getAttribute('data-phase') === phaseConfig.className) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  const updateAmbience = () => {
    if (isManualMode) return;

    const activePhase = getCurrentPhase();
    if (!document.body.classList.contains(activePhase.className)) {
      setPhase(activePhase);
    }
  };

  // 1. Toggle Control Panel Collapse
  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('active');
    });
  }

  // 2. Sync switch logic
  if (syncCheckbox) {
    syncCheckbox.addEventListener('change', () => {
      isManualMode = !syncCheckbox.checked;
      
      // Stop cycling demo if checked
      if (!isManualMode) {
        stopCyclingDemo();
        updateAmbience();
      }
    });
  }

  // 3. Manual Button Clicks
  phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Disable sync & stop demo
      if (syncCheckbox) syncCheckbox.checked = false;
      isManualMode = true;
      stopCyclingDemo();

      const targetClassName = btn.getAttribute('data-phase');
      // Find matching config
      let match = null;
      for (const key in PHASES) {
        if (PHASES[key].className === targetClassName) {
          match = PHASES[key];
          break;
        }
      }
      if (match) setPhase(match);
    });
  });

  // 4. Demo Cycle Play / Stop
  const startCyclingDemo = () => {
    if (syncCheckbox) syncCheckbox.checked = false;
    isManualMode = true;

    const phaseList = Object.values(PHASES);
    let index = 0;

    // Set first phase
    setPhase(phaseList[index]);
    index = (index + 1) % phaseList.length;

    demoBtn.textContent = '🛑 Stop Transition Cycle';
    demoBtn.classList.add('cycling');

    cycleInterval = setInterval(() => {
      setPhase(phaseList[index]);
      index = (index + 1) % phaseList.length;
    }, 4500); // 4.5 seconds gives the 2.5s CSS transition time to play out
  };

  const stopCyclingDemo = () => {
    if (cycleInterval) {
      clearInterval(cycleInterval);
      cycleInterval = null;
    }
    if (demoBtn) {
      demoBtn.textContent = '✨ Play Transition Cycle';
      demoBtn.classList.remove('cycling');
    }
  };

  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      if (cycleInterval) {
        stopCyclingDemo();
        if (syncCheckbox) syncCheckbox.checked = true;
        isManualMode = false;
        updateAmbience();
      } else {
        startCyclingDemo();
      }
    });
  }

  // Initialize
  updateAmbience();
  setInterval(updateAmbience, 5000);
}
