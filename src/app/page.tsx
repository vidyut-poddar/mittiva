'use client';

import React, { useState, useEffect, useRef } from 'react';

// Interfaces
interface ClothingItem {
  id: string;
  title: string;
  category: 'tops' | 'bottoms' | 'full-body' | 'jackets' | 'hoodies' | 'shirts' | 't-shirts' | 'pants' | 'jeans' | 'shorts' | 'handbags' | 'shoulderbags' | 'caps' | 'hats' | 'glasses' | 'other';
  imageUrl: string;
  gender: 'male' | 'female' | 'unisex';
  price?: number;
}

interface ModelPose {
  id: string;
  name: string;
  backgrounds: Record<string, string>;
}

interface DefaultModel {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  poses: ModelPose[];
}

// 4 custom generated high-fidelity Indian models from West Bengal (Kolkata)
const DEFAULT_MODELS: DefaultModel[] = [
  {
    id: 'model-female-ananya',
    name: 'Ananya (Light Female)',
    gender: 'female',
    poses: [
      {
        id: 'front',
        name: 'Frontal Standing',
        backgrounds: {
          studio: '/ananya_front.png',
          cafe: '/ananya_front.png',
          boutique: '/ananya_front.png',
          neon: '/ananya_front.png',
        },
      },
      {
        id: 'side',
        name: 'Three-Quarter Turn',
        backgrounds: {
          studio: '/ananya_side.png',
          cafe: '/ananya_side.png',
          boutique: '/ananya_side.png',
          neon: '/ananya_side.png',
        },
      },
      {
        id: 'action',
        name: 'Dynamic Walking',
        backgrounds: {
          studio: '/ananya_action.png',
          cafe: '/ananya_action.png',
          boutique: '/ananya_action.png',
          neon: '/ananya_action.png',
        },
      },
    ],
  },
  {
    id: 'model-male-sourav',
    name: 'Sourav (Light Male)',
    gender: 'male',
    poses: [
      {
        id: 'front',
        name: 'Frontal Standing',
        backgrounds: {
          studio: '/sourav_front.png',
          cafe: '/sourav_front.png',
          boutique: '/sourav_front.png',
          neon: '/sourav_front.png',
        },
      },
      {
        id: 'side',
        name: 'Three-Quarter Turn',
        backgrounds: {
          studio: '/sourav_side.png',
          cafe: '/sourav_side.png',
          boutique: '/sourav_side.png',
          neon: '/sourav_side.png',
        },
      },
      {
        id: 'action',
        name: 'Action Walk',
        backgrounds: {
          studio: '/sourav_action.png',
          cafe: '/sourav_action.png',
          boutique: '/sourav_action.png',
          neon: '/sourav_action.png',
        },
      },
    ],
  },
  {
    id: 'model-female-priyanka',
    name: 'Priyanka (Medium Female)',
    gender: 'female',
    poses: [
      {
        id: 'front',
        name: 'Frontal Standing',
        backgrounds: {
          studio: '/priyanka_front.png',
          cafe: '/priyanka_front.png',
          boutique: '/priyanka_front.png',
          neon: '/priyanka_front.png',
        },
      },
      {
        id: 'side',
        name: 'Profile Look',
        backgrounds: {
          studio: '/priyanka_side.png',
          cafe: '/priyanka_side.png',
          boutique: '/priyanka_side.png',
          neon: '/priyanka_side.png',
        },
      },
      {
        id: 'action',
        name: 'Dynamic Studio',
        backgrounds: {
          studio: '/priyanka_action.png',
          cafe: '/priyanka_action.png',
          boutique: '/priyanka_action.png',
          neon: '/priyanka_action.png',
        },
      },
    ],
  },
  {
    id: 'model-male-kabir',
    name: 'Kabir (Medium Male)',
    gender: 'male',
    poses: [
      {
        id: 'front',
        name: 'Frontal Standing',
        backgrounds: {
          studio: '/kabir_front.png',
          cafe: '/kabir_front.png',
          boutique: '/kabir_front.png',
          neon: '/kabir_front.png',
        },
      },
      {
        id: 'side',
        name: 'Three-Quarter Turn',
        backgrounds: {
          studio: '/kabir_side.png',
          cafe: '/kabir_side.png',
          boutique: '/kabir_side.png',
          neon: '/kabir_side.png',
        },
      },
      {
        id: 'action',
        name: 'Action Walk',
        backgrounds: {
          studio: '/kabir_action.png',
          cafe: '/kabir_action.png',
          boutique: '/kabir_action.png',
          neon: '/kabir_action.png',
        },
      },
    ],
  },
];

const BACKGROUNDS = [
  { id: 'studio', name: 'Studio', desc: 'Grey backdrop' },
  { id: 'cafe', name: 'Paris Cafe', desc: 'Sunny cafe terrace' },
  { id: 'boutique', name: 'Boutique', desc: 'Premium showroom' },
  { id: 'neon', name: 'Cyber Neon', desc: 'Neon city street' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// HTML5 Star Constellation Canvas Background matching mittiva.io
function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.07 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-bg" aria-hidden="true" />;
}


export default function ChangingRoomDashboard() {
  // Query parameters state
  const [params, setParams] = useState({
    locationId: '',
    contactId: '',
    contactName: '',
    contactEmail: '',
  });

  // App State
  const [activeTab, setActiveTab] = useState<'catalog' | 'add-garment'>('catalog');
  const [catalog, setCatalog] = useState<ClothingItem[]>([]);
  const [selectedGarments, setSelectedGarments] = useState<ClothingItem[]>([]);
  
  // Model Setup State
  const [selectedModel, setSelectedModel] = useState<DefaultModel>(DEFAULT_MODELS[0]);
  const [selectedPose, setSelectedPose] = useState<string>('front');
  const [selectedBackground, setSelectedBackground] = useState<string>('studio');
  
  const [modelImage, setModelImage] = useState<string>('');
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  // Sizing State
  const [customerSize, setCustomerSize] = useState<string>('M');
  const [garmentSize, setGarmentSize] = useState<string>('M');
  
  // Try-on generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [resultImage, setResultImage] = useState<string>('');
  const [isMock, setIsMock] = useState(false);
  const [ghlSyncStatus, setGhlSyncStatus] = useState<{ synced: boolean; error: string | null } | null>(null);


  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);

  // Search/Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'tops' | 'bottoms' | 'full-body' | 'jackets' | 'hoodies' | 'shirts' | 't-shirts' | 'pants' | 'jeans' | 'shorts' | 'handbags' | 'shoulderbags' | 'caps' | 'hats' | 'glasses'>('all');

  // New garment form state
  const [newGarment, setNewGarment] = useState({
    title: '',
    category: 'tops' as any,
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    imageUrl: '',
    price: '',
  });
  const [isUploadingGarment, setIsUploadingGarment] = useState(false);

  // Parse search params in client side to prevent Next.js build Suspense warning
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const locId = searchParams.get('locationId') || '';
      const conId = searchParams.get('contactId') || '';
      const conName = searchParams.get('contactName') || '';
      const conEmail = searchParams.get('contactEmail') || '';
      
      setParams({
        locationId: locId,
        contactId: conId,
        contactName: conName,
        contactEmail: conEmail,
      });
    }
  }, []);

  // Fetch clothing catalog once location ID is parsed
  useEffect(() => {
    if (params.locationId) {
      fetchCatalog();
    }
  }, [params.locationId]);

  // Dynamically update default model base image depending on pose and background choice
  useEffect(() => {
    if (!customModelFile) {
      const activePose = selectedModel.poses.find((p) => p.id === selectedPose) || selectedModel.poses[0];
      const activeBgImage = activePose.backgrounds[selectedBackground] || activePose.backgrounds.studio;
      setModelImage(activeBgImage);
    }
  }, [selectedModel, selectedPose, selectedBackground, customModelFile]);

  // Derived steps list for loading progress calculator
  const stages = selectedGarments.map((g) => `Fitting selected ${g.title} (${g.category})...`);
  const stepsList = [
    'Segmenting target model frame contours...',
    ...stages.flatMap((stage) => [stage, 'Perfecting material folds & drapery...']),
    'Updating visual output layer...',
  ];

  // Derived measurement specs for HUD tags
  const getShoulderWidth = () => {
    return customerSize === 'XS' ? '40 cm' : customerSize === 'S' ? '42 cm' : customerSize === 'M' ? '45 cm' : customerSize === 'L' ? '48 cm' : customerSize === 'XL' ? '51 cm' : '54 cm';
  };
  const getWaistSize = () => {
    return customerSize === 'XS' ? '72 cm' : customerSize === 'S' ? '76 cm' : customerSize === 'M' ? '82 cm' : customerSize === 'L' ? '88 cm' : customerSize === 'XL' ? '94 cm' : '102 cm';
  };
  const getSleeveLen = () => {
    return garmentSize === 'XS' ? '58 cm' : garmentSize === 'S' ? '60 cm' : garmentSize === 'M' ? '62 cm' : garmentSize === 'L' ? '64 cm' : garmentSize === 'XL' ? '66 cm' : '68 cm';
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`/api/catalog?locationId=${params.locationId}`);
      const data = await res.json();
      if (data.catalog) {
        setCatalog(data.catalog);
        if (data.catalog.length > 0) {
          setSelectedGarments([data.catalog[0]]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clothing catalog:', err);
    }
  };

  // Garment selection handler (Mix & Match multi-select logic)
  const handleSelectGarment = (item: ClothingItem) => {
    setSelectedGarments((prev) => {
      if (item.category === 'full-body') {
        return [item];
      }

      let nextList = prev.filter((g) => g.category !== 'full-body');

      if (nextList.some((g) => g.id === item.id)) {
        return nextList.filter((g) => g.id !== item.id);
      }

      nextList = nextList.filter((g) => g.category !== item.category);
      nextList.push(item);
      return nextList;
    });
  };

  // Size evaluation predictor details
  const getFittingLabel = () => {
    const custIdx = SIZES.indexOf(customerSize);
    const garmIdx = SIZES.indexOf(garmentSize);

    if (garmIdx > custIdx) {
      return {
        type: 'loose',
        badge: 'Loose / Oversized fit',
        description: 'Drop-shoulder styling drape.',
      };
    } else if (garmIdx === custIdx) {
      return {
        type: 'regular',
        badge: 'Regular / Tailored fit',
        description: 'Natural contours matching.',
      };
    } else {
      return {
        type: 'tight',
        badge: 'Tight / Snug fit',
        description: 'Snug wrist and short hem drape.',
      };
    }
  };

  // Upload handlers
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingModel(true);
    setCustomModelFile(file);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.imageUrl) {
          setModelImage(uploadData.imageUrl);
        } else {
          alert('Upload failed: ' + (uploadData.error || 'Unknown error'));
        }
        setIsUploadingModel(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading model photo:', err);
      setIsUploadingModel(false);
    }
  };

  const handleGarmentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGarment(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.imageUrl) {
          setNewGarment(prev => ({ ...prev, imageUrl: uploadData.imageUrl }));
        } else {
          alert('Garment upload failed: ' + (uploadData.error || 'Unknown error'));
        }
        setIsUploadingGarment(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading garment photo:', err);
      setIsUploadingGarment(false);
    }
  };

  const handleAddGarmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGarment.title || !newGarment.imageUrl) {
      alert('Please fill out the title and upload a garment photo.');
      return;
    }

    try {
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: params.locationId,
          title: newGarment.title,
          category: newGarment.category,
          imageUrl: newGarment.imageUrl,
          price: newGarment.price,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCatalog(data.catalog);
        setSelectedGarments([data.item]);
        setNewGarment({
          title: '',
          category: 'tops',
          gender: 'unisex',
          imageUrl: '',
          price: '',
        });
        setActiveTab('catalog');
      } else {
        alert('Failed to add garment: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving garment:', err);
    }
  };

  const handleDeleteGarment = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this clothing item?')) return;

    try {
      const res = await fetch(`/api/catalog?locationId=${params.locationId}&itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCatalog(data.catalog);
        setSelectedGarments(prev => prev.filter(g => g.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to delete garment:', err);
    }
  };

  // Main try-on trigger
  const handleGenerateTryon = async () => {
    if (selectedGarments.length === 0) {
      alert('Please select at least one garment from the catalog.');
      return;
    }

    setIsGenerating(true);
    setResultImage('');
    setGhlSyncStatus(null);

    let currentStep = 0;
    setGenerationStep(0);
    const interval = setInterval(() => {
      if (currentStep < stepsList.length - 1) {
        currentStep++;
        setGenerationStep(currentStep);
      }
    }, 1500);

    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelImage,
          garments: selectedGarments.map((g) => ({
            imageUrl: g.imageUrl,
            category: g.category,
          })),
          locationId: params.locationId !== 'demo_location_123' ? params.locationId : undefined,
          contactId: params.contactId || undefined,
          gender: selectedModel.gender,
          background: selectedBackground,
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success) {
        setResultImage(data.imageUrl);
        setIsMock(data.mock);
        if (data.ghlSync && (params.locationId || params.contactId)) {
          setGhlSyncStatus({
            synced: data.ghlSync.synced,
            error: data.ghlSync.error,
          });
        }
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to generate try-on:', err);
      clearInterval(interval);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter & Search catalog
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const fittingReport = getFittingLabel();

  // Render Landing page if no locationId is specified
  if (!params.locationId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-zinc-150 relative bg-[#02040A]">
        <ConstellationBackground />
        
        <div className="absolute top-[10%] left-[8%] text-[8px] font-mono text-zinc-650 tracking-[0.2em] pointer-events-none select-none">
          SYS.LOC.X00 // INITIALIZING STAGE
        </div>

        <div className="max-w-4xl w-full text-center space-y-12 z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-mono tracking-widest uppercase mb-2">
              • MITTIVA AI STUDIO •
            </div>
            <h1 className="text-6xl md:text-9xl font-extrabold tracking-tight font-tight text-gradient uppercase">
              Mittiva Fit
            </h1>
            <p className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
              "AI shouldn't only belong to big companies. It should belong to the tailor, the boutique, the salon — anyone with the courage to run their own thing."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-panel p-6 rounded-2xl text-left border-zinc-900 tech-corners">
              <span className="text-[9px] text-zinc-600 font-mono block mb-1">01 / STAGE</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Central Hologram Projection</h4>
              <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">An avant-garde central viewport showing interactive likeness projection and live laser scanning sweep lines.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-left border-zinc-900 tech-corners">
              <span className="text-[9px] text-zinc-600 font-mono block mb-1">02 / CALIBRATOR</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Segmented Fitting HUD</h4>
              <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">Sizing controllers configured as interactive digital rails linking client parameters to model garment specs.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-left border-zinc-900 tech-corners">
              <span className="text-[9px] text-zinc-600 font-mono block mb-1">03 / INVENTORY</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Multi-Garment Seeding</h4>
              <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">Pre-loaded inventory containing cargo pants, custom silk jackets, pleated trousers, and traditional silk saris.</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl max-w-sm mx-auto space-y-6 border-zinc-900 tech-corners">
            <div className="space-y-1">
              <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400">INITIATE CONNECTION</h3>
              <p className="text-zinc-650 text-[9px] font-mono">Establish sub-account authorization</p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="/api/ghl/auth"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all text-[10px] uppercase tracking-widest glow-effect border border-indigo-500/20"
              >
                Link GHL Location
              </a>

              <a
                href="/?locationId=demo_location_123"
                className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-350 border border-zinc-900 font-semibold active:scale-[0.98] transition-all text-center text-[10px] uppercase tracking-widest font-mono"
              >
                Enter Playground
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040A] text-zinc-200 flex flex-col p-4 md:p-6 space-y-6 relative overflow-hidden font-sans">
      <ConstellationBackground />

      {/* Floating System Bar */}
      <header className="glass-panel p-4 rounded-xl flex items-center justify-between border-zinc-900 tech-corners z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
            MT
          </div>
          <div className="text-left font-mono">
            <h2 className="text-xs font-black tracking-widest text-zinc-300 uppercase">Mittiva Neural Console</h2>
            <p className="text-zinc-600 text-[8px] tracking-widest uppercase">System version 1.10.4 // Kolkata</p>
          </div>
        </div>

        {params.contactId ? (
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg text-[9px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-zinc-500">SUBJECT:</span>
            <span className="text-zinc-300 font-bold uppercase">{params.contactName}</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 text-[9px] font-mono tracking-widest uppercase select-none">
            MODE: DEMO_PLAYGROUND
          </div>
        )}
      </header>

      {/* Avant-Garde Holographic Chamber Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10 relative">
        
        {/* Left Console Panel: Floating helix catalog (3 columns) */}
        <div className="lg:col-span-3 h-full z-20">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-zinc-900 tech-corners shadow-xl h-full">
          <div className="space-y-4">
            <div className="flex border-b border-zinc-950 pb-2">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 pb-1.5 text-center text-[9px] font-mono uppercase tracking-widest transition-all ${
                  activeTab === 'catalog'
                    ? 'text-indigo-400 font-bold border-b border-indigo-400'
                    : 'text-zinc-650 hover:text-zinc-400'
                }`}
              >
                [ Items ]
              </button>
              <button
                onClick={() => setActiveTab('add-garment')}
                className={`flex-1 pb-1.5 text-center text-[9px] font-mono uppercase tracking-widest transition-all ${
                  activeTab === 'add-garment'
                    ? 'text-indigo-400 font-bold border-b border-indigo-400'
                    : 'text-zinc-650 hover:text-zinc-400'
                }`}
              >
                [ Create ]
              </button>
            </div>

            {activeTab === 'catalog' ? (
              <div className="space-y-4">
                {/* Search Bar & Categorization helix */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search matrix..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg outline-none text-[10px] text-zinc-300 font-mono"
                  />
                  
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                    {(['all', 'tops', 'bottoms', 'full-body', 'jackets', 'hoodies', 'shirts', 't-shirts', 'pants', 'jeans', 'shorts', 'handbags', 'shoulderbags', 'caps', 'hats', 'glasses'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-widest border transition-all shrink-0 ${
                          categoryFilter === cat
                            ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-bold'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layering Wardrobe Console */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Layering console</span>
                    {selectedGarments.length > 0 && (
                      <button
                        onClick={() => setSelectedGarments([])}
                        className="text-[7px] font-mono text-zinc-600 hover:text-[#FF3B70] uppercase tracking-wider"
                      >
                        [ Clear ]
                      </button>
                    )}
                  </div>

                  {selectedGarments.length === 0 ? (
                    <p className="text-[8px] text-zinc-700 font-mono italic">No items loaded. Select cards below to construct outfit.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedGarments.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <img src={g.imageUrl} alt={g.title} className="w-6 h-6 rounded object-cover" />
                            <div className="flex flex-col text-left">
                              <span className="text-[9px] font-bold text-zinc-300 truncate max-w-[100px]">{g.title}</span>
                              {g.price !== undefined && (
                                <span className="text-[7px] text-indigo-400 font-mono">₹{g.price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectGarment(g)}
                            className="text-[9px] text-zinc-500 hover:text-rose-400 font-mono font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCatalogExpanded(true)}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                >
                  ⤢ EXPAND WARDROBE DECK
                </button>

                {/* Catalog Card Helix */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => {
                    const isSelected = selectedGarments.some((g) => g.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectGarment(item)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-[#FF3B70]/5 border-[#FF3B70]/30 active-garm-card'
                            : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-zinc-900" />
                          <div className="text-left">
                            <span className="text-[7px] text-[#FF3B70] font-mono uppercase tracking-widest block">{item.category}</span>
                            <span className="text-[9px] font-bold text-zinc-200 block truncate max-w-[110px]">{item.title}</span>
                            {item.price !== undefined && (
                              <span className="text-[8px] text-zinc-400 font-mono block">₹{item.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B70] animate-pulse" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGarment(item.id, e);
                            }}
                            className="text-[9px] text-zinc-600 hover:text-red-500 font-mono font-bold p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddGarmentSubmit} className="space-y-3.5 text-left font-mono">
                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-550 uppercase tracking-wider block">Asset Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Sari"
                    value={newGarment.title}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg outline-none text-[9px] text-zinc-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-550 uppercase tracking-wider block">Drape Category</label>
                  <select
                    value={newGarment.category}
                    onChange={(e: any) => setNewGarment(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg outline-none text-[9px] text-zinc-300"
                  >
                    <option value="jackets">Jackets</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="shirts">Shirts</option>
                    <option value="t-shirts">T Shirts</option>
                    <option value="pants">Pants</option>
                    <option value="jeans">Jeans</option>
                    <option value="shorts">Shorts</option>
                    <option value="handbags">Handbags</option>
                    <option value="shoulderbags">Shoulderbags</option>
                    <option value="caps">Caps</option>
                    <option value="hats">Hats</option>
                    <option value="glasses">Glasses</option>
                    <option value="tops">Tops (Other)</option>
                    <option value="bottoms">Bottoms (Other)</option>
                    <option value="full-body">Full-Body (Other)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-550 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 2499"
                    value={newGarment.price}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg outline-none text-[9px] text-zinc-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-550 uppercase tracking-wider block">Image Source</label>
                  <div className="border border-dashed border-zinc-900 hover:border-zinc-800 rounded-lg p-5 text-center cursor-pointer relative bg-zinc-950">
                    {isUploadingGarment ? (
                      <div className="flex flex-col items-center gap-1 py-3">
                        <div className="w-3.5 h-3.5 border border-t-transparent border-indigo-400 rounded-full animate-spin" />
                        <span className="text-[8px] text-zinc-500 uppercase tracking-wider">Loading...</span>
                      </div>
                    ) : newGarment.imageUrl ? (
                      <div className="relative aspect-video rounded overflow-hidden max-h-20 mx-auto">
                        <img src={newGarment.imageUrl} alt="Garment Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewGarment(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute inset-0 bg-black/85 flex items-center justify-center text-[8px] text-rose-400 font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <p className="text-[9px] text-zinc-400">Click to upload garment photo</p>
                        <p className="text-[7px] text-zinc-600">JPG, PNG (pre-cropped)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGarmentFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploadingGarment || !newGarment.imageUrl}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 disabled:bg-zinc-950 disabled:text-zinc-700 text-white font-bold text-[9px] uppercase tracking-widest border border-indigo-500/20"
                >
                  Register Asset
                </button>
              </form>
            )}
          </div>
          
          <div className="text-[7px] font-mono text-zinc-600 leading-normal uppercase border-t border-zinc-900/60 pt-3">
            Mittiva Changing Room Portal // Chennai 2026. Custom AI model overlays.
          </div>
          </div>
        </div>

        {/* Center Console Panel: Hologram Projection Pod Stage (6 columns) */}
        <section className="lg:col-span-6 flex flex-col justify-between items-center relative p-2 min-h-[480px] z-10">
          
          {/* Active Blueprint scanning grids */}
          <div className="absolute top-[5%] left-[5%] text-[8px] font-mono text-zinc-700 select-none pointer-events-none">
            [ TENSOR.CORE: ONLINE ]<br />
            [ LATENCY: 1.2s ]
          </div>
          <div className="absolute top-[5%] right-[5%] text-[8px] font-mono text-zinc-700 select-none pointer-events-none text-right">
            [ COORDINATES ]<br />
            [ X: 190.22, Y: 89.04 ]
          </div>

          {/* Central Projection Stage Container */}
          <div className="relative flex-1 w-full max-w-[460px] aspect-[3/4] flex items-center justify-center my-auto z-10">
            <div className="w-full h-full relative flex items-center justify-center">
              
              {/* Hologram Stage Platform base rings */}
              <div className="holo-chamber" />
              <div className="radar-ring" />
              <div className="radar-ring radar-ring-2" />

              {/* Scanning Vertical Line sweep */}
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.5)] pointer-events-none animate-pulse z-10" style={{ top: '40%' }} />

              {/* Immersive Hologram Display */}
              <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-950/60 flex items-center justify-center relative shadow-2xl z-10">
                {isGenerating ? (
                  /* Holographic Generation System loader overlay */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 z-30 overflow-hidden bg-zinc-950/90 backdrop-blur-sm">
                    {/* Glowing radar target simulation grid backdrop */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(99,102,241,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
                    
                    {/* Rotating Scanner rings spinner */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin [animation-duration:12s]" />
                      <div className="absolute w-12 h-12 border-2 border-indigo-500/50 rounded-full animate-spin [animation-duration:6s] border-t-transparent border-b-transparent" />
                      <div className="absolute w-6 h-6 border-2 border-[#FF3B70] rounded-full animate-ping" />
                    </div>

                    {/* Floating HUD loader details */}
                    <div className="relative text-center max-w-[220px] font-mono z-10 space-y-3">
                      <span className="text-[8px] text-[#FF3B70] font-black uppercase tracking-widest animate-pulse block">
                        • NEURAL LINK ACTIVE •
                      </span>
                      <p className="text-[9px] text-zinc-300 leading-relaxed h-10 overflow-hidden">
                        {stepsList[generationStep]}
                      </p>
                      
                      {/* Progress tracking loader gauge */}
                      <div className="w-24 h-0.5 bg-zinc-900 rounded-full mx-auto overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF3B70] to-indigo-600 transition-all duration-700" 
                          style={{ width: `${((generationStep + 1) / stepsList.length) * 100}%` }}
                        />
                      </div>
                      <div className="text-[6px] text-zinc-500 uppercase tracking-widest">
                        ESTIMATING FIT MATRICES
                      </div>
                    </div>
                  </div>
                ) : resultImage ? (
                  /* Before/After slider embedded directly on the main projection stage! */
                  <BeforeAfterSlider original={modelImage} modified={resultImage} />
                ) : modelImage ? (
                  <img src={modelImage} alt="Hologram Stage Preview" className="w-full h-full object-cover transition-all duration-500" />
                ) : (
                  <span className="text-zinc-700 text-xs font-mono">NO_HOLOGRAM_SOURCE</span>
                )}

                {/* Silhouette visual grid outline overlay */}
                {!resultImage && <div className="silhouette-guide" />}
              </div>

              {/* Floating HUD Measurement Pointer tags (Absolute-positioned around avatar) */}
              {!isGenerating && (
                <>
                  {/* Shoulder Tag (Top-left) */}
                  <div className="absolute top-[20%] -left-12 bg-zinc-950/90 border border-zinc-850 px-2.5 py-1.5 rounded-lg text-left text-zinc-300 font-mono shadow-xl z-20 hud-tag select-none" style={{ animationDelay: '0.2s' }}>
                    <span className="text-[7px] text-[#FF3B70] font-bold block uppercase tracking-wider">SHOULDERS</span>
                    <span className="text-[9px] font-black block">{getShoulderWidth()}</span>
                    {/* Connector indicator tag */}
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-indigo-500/30" />
                  </div>

                  {/* Waist Tag (Middle-right) */}
                  <div className="absolute top-[48%] -right-12 bg-zinc-950/90 border border-zinc-850 px-2.5 py-1.5 rounded-lg text-left text-zinc-300 font-mono shadow-xl z-20 hud-tag select-none" style={{ animationDelay: '0.8s' }}>
                    <span className="text-[7px] text-cyan-400 font-bold block uppercase tracking-wider">WAIST DEPTH</span>
                    <span className="text-[9px] font-black block">{getWaistSize()}</span>
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-indigo-500/30" />
                  </div>

                  {/* Sleeve Tag (Lower-left) */}
                  <div className="absolute bottom-[24%] -left-12 bg-zinc-950/90 border border-zinc-850 px-2.5 py-1.5 rounded-lg text-left text-zinc-300 font-mono shadow-xl z-20 hud-tag select-none" style={{ animationDelay: '1.4s' }}>
                    <span className="text-[7px] text-indigo-400 font-bold block uppercase tracking-wider">SLEEVE PROFILE</span>
                    <span className="text-[9px] font-black block">{getSleeveLen()}</span>
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-indigo-500/30" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Central Trigger Cockpit Console (Pulls trigger at bottom center) */}
          <div className="w-full max-w-sm mt-4 space-y-3 z-20">
            <button
              onClick={handleGenerateTryon}
              disabled={isGenerating || selectedGarments.length === 0 || !modelImage}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border-transparent text-white font-extrabold text-[10px] uppercase tracking-[0.2em] border border-indigo-500/30 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all text-center glow-effect"
            >
              [ INITIATE NEURAL TRY-ON ]
            </button>
            <div className="text-[8px] font-mono text-zinc-550 select-none text-center">
              FASHN V1.6 STABLE DIFFUSION virtual fitting engine. Coordinates generated dynamically.
            </div>
          </div>
        </section>

        {/* Right Console Panel: Calibration deck (3 columns) */}
        <div className="lg:col-span-3 h-full z-20 text-left">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-zinc-900 tech-corners shadow-xl h-full text-left">
          
          {/* Sizing & Calibration controls */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold border-b border-zinc-950 pb-2">
              [ Calibrators ]
            </h3>

            {/* Sizing Rails (Segmented track visual slider) */}
            <div className="space-y-4">
              <label className="text-[8px] text-amber-500 font-mono uppercase tracking-widest block">[ Size calibration rails ]</label>
              
              {/* Client rail */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                  <span>SUBJECT PROFILE</span>
                  <span className="text-zinc-300 font-bold">{customerSize}</span>
                </div>
                <div className="relative flex justify-between items-center h-5 bg-zinc-950 border border-zinc-900 rounded-lg px-2 shadow-inner">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCustomerSize(size)}
                      className={`text-[8px] font-bold font-mono px-1 rounded transition-all ${
                        customerSize === size
                          ? 'text-indigo-400 bg-indigo-500/10 font-black'
                          : 'text-zinc-650 hover:text-zinc-450'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment rail */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                  <span>GARMENT SPEC</span>
                  <span className="text-zinc-300 font-bold">{garmentSize}</span>
                </div>
                <div className="relative flex justify-between items-center h-5 bg-zinc-950 border border-zinc-900 rounded-lg px-2 shadow-inner">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setGarmentSize(size)}
                      className={`text-[8px] font-bold font-mono px-1 rounded transition-all ${
                        garmentSize === size
                          ? 'text-[#FF3B70] bg-[#FF3B70]/10 font-black'
                          : 'text-zinc-650 hover:text-zinc-450'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connecting drape analyzer HUD */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-zinc-500 font-mono">DRAPE INDEX:</span>
                  <span className={`fit-badge ${
                    fittingReport.type === 'loose' ? 'fit-loose' : fittingReport.type === 'tight' ? 'fit-tight' : 'fit-regular'
                  }`}>
                    {fittingReport.badge}
                  </span>
                </div>
                <p className="text-[8px] text-zinc-500 leading-normal font-mono">{fittingReport.description}</p>
              </div>
            </div>

            {/* Model Setup Matrices */}
            <div className="space-y-3.5 border-t border-zinc-900/60 pt-4">
              
              {/* Persona Selector */}
              <div className="space-y-2">
                <label className="text-[8px] text-[#FF3B70] font-mono uppercase tracking-widest block">[ Subject persona ]</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DEFAULT_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setCustomModelFile(null);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                        selectedModel.id === model.id && !customModelFile
                          ? 'border-[#FF3B70] scale-[0.98]'
                          : 'border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <img src={model.poses[0].backgrounds.studio} alt={model.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pose Matrix */}
              {!customModelFile && (
                <div className="space-y-2">
                  <label className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest block">[ Pose configuration ]</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedModel.poses.map((pose) => (
                      <button
                        key={pose.id}
                        onClick={() => setSelectedPose(pose.id)}
                        className={`py-1.5 rounded-lg text-[8px] font-mono border transition-all uppercase tracking-widest ${
                          selectedPose === pose.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                        }`}
                      >
                        {pose.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment backdrop matrix */}
              {!customModelFile && (
                <div className="space-y-2">
                  <label className="text-[8px] text-cyan-400 font-mono uppercase tracking-widest block">[ Backdrop setting ]</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          selectedBackground === bg.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-850'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider block">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sync logs feedback */}
          <div className="space-y-3.5 border-t border-zinc-900/60 pt-4">
            {ghlSyncStatus && (
              <div className={`p-3 rounded-xl border text-[8px] leading-relaxed font-mono uppercase ${
                ghlSyncStatus.synced 
                  ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' 
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
              }`}>
                <span className="font-bold block mb-1">
                  {ghlSyncStatus.synced ? '✓ CRM WRITEBACK OK' : '⚠ WRITEBACK ERROR'}
                </span>
                <p className="text-zinc-500 lowercase leading-normal">
                  {ghlSyncStatus.synced 
                    ? `image synced back to ghl contact field properties successfully.`
                    : `GHL code: ${ghlSyncStatus.error}`
                  }
                </p>
              </div>
            )}

            {resultImage && isMock && (
              <div className="bg-amber-500/5 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-[8px] leading-relaxed font-mono select-none uppercase">
                <span className="font-bold block mb-0.5">• PLAYGROUND SCAN •</span>
                <p className="text-zinc-500 lowercase leading-normal">simulation active. returned pre-computed styled backdrop matching parameters.</p>
              </div>
            )}
          </div>
          </div>
        </div>

      </div>

      {/* Full-Screen Expanded Catalog Deck Modal */}
      {isCatalogExpanded && (
        <div className="fixed inset-0 bg-[#02040A]/98 backdrop-blur-md z-50 overflow-y-auto p-6 flex flex-col font-mono text-zinc-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
                MT
              </div>
              <div className="text-left font-mono">
                <h2 className="text-sm font-black tracking-widest text-zinc-300 uppercase">Neural Wardrobe Deck</h2>
                <p className="text-zinc-650 text-[9px] tracking-widest uppercase">Select garments for try-on simulation // prices details</p>
              </div>
            </div>

            <button
              onClick={() => setIsCatalogExpanded(false)}
              className="px-4 py-2 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-400 font-bold rounded-lg text-xs transition-all uppercase tracking-widest cursor-pointer"
            >
              [ Close Catalog ]
            </button>
          </div>

          {/* Filters & Search in Modal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg outline-none text-xs text-zinc-300 font-mono focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-8 flex gap-2 items-center overflow-x-auto max-w-full scrollbar-thin">
              {(['all', 'tops', 'bottoms', 'full-body', 'jackets', 'hoodies', 'shirts', 't-shirts', 'pants', 'jeans', 'shorts', 'handbags', 'shoulderbags', 'caps', 'hats', 'glasses'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-widest border transition-all shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-bold'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selected items indicator in Modal */}
          {selectedGarments.length > 0 && (
            <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Equipped Outfits ({selectedGarments.length}):</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedGarments.map((g) => (
                    <div key={g.id} className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-2.5 py-1 rounded-lg text-[10px]">
                      <span className="text-zinc-300">{g.title}</span>
                      {g.price !== undefined && <span className="text-indigo-400 font-bold">₹{g.price.toFixed(2)}</span>}
                      <button
                        onClick={() => handleSelectGarment(g)}
                        className="text-zinc-600 hover:text-[#FF3B70] font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedGarments([])}
                className="text-[10px] text-[#FF3B70] hover:underline uppercase tracking-widest font-bold"
              >
                [ Clear All ]
              </button>
            </div>
          )}

          {/* Grid list of catalog items with prices and clear image sizes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 flex-1">
            {filteredCatalog.map((item) => {
              const isSelected = selectedGarments.some((g) => g.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectGarment(item)}
                  className={`group relative flex flex-col bg-zinc-950/60 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-[#FF3B70] shadow-[0_0_20px_rgba(255,59,112,0.25)] bg-[#FF3B70]/5'
                      : 'border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  {/* Large Product Image wrapper */}
                  <div className="aspect-[3/4] w-full overflow-hidden relative bg-zinc-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Category tag overlay */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-zinc-850 text-[8px] text-[#FF3B70] font-bold uppercase tracking-widest">
                      {item.category}
                    </span>

                    {/* Gender indicator overlay */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-zinc-850 text-[8px] text-zinc-450 font-bold uppercase tracking-widest">
                      {item.gender}
                    </span>

                    {/* Checkmark indicator overlay if selected */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#FF3B70]/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-[#FF3B70] text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-[#FF3B70]/40">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-all truncate">
                        {item.title}
                      </h4>
                      {item.price !== undefined ? (
                        <p className="text-sm font-black text-indigo-400 font-mono mt-1">
                          ₹{item.price.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-650 italic mt-1">
                          Price not set
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                          isSelected
                            ? 'bg-[#FF3B70] text-white font-bold'
                            : 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Equipped' : 'Equip'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGarment(item.id, e);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-900 hover:border-red-500 hover:text-red-500 text-zinc-600 transition-all cursor-pointer"
                        title="Delete product"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Before/After Image Clip Slider Component (Embedded inside Hologram Viewport)
function BeforeAfterSlider({ original, modified }: { original: string; modified: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Background (Tried on result) */}
      <img
        src={modified}
        alt="Tried on result"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Foreground Clipped (Original model) */}
      <img
        src={original}
        alt="Original model"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      />

      {/* Sliding bar divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border border-zinc-350 shadow-2xl flex items-center justify-center text-[7px] text-zinc-800 font-mono font-bold">
          ↔
        </div>
      </div>
      
      {/* Visual Helpers badges */}
      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-zinc-950/90 border border-zinc-850 text-[7px] font-mono font-black text-zinc-300 uppercase tracking-widest">
        ORIGINAL
      </span>
      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-zinc-950/90 border border-zinc-850 text-[7px] font-mono font-black text-zinc-300 uppercase tracking-widest">
        TRY-ON
      </span>
    </div>
  );
}
