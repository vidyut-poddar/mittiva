import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface GHLTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in ms
  locationId: string;
  companyId?: string;
}

export interface ClothingItem {
  id: string;
  title: string;
  category: 'tops' | 'bottoms' | 'full-body' | 'jackets' | 'hoodies' | 'shirts' | 't-shirts' | 'pants' | 'jeans' | 'shorts' | 'handbags' | 'shoulderbags' | 'caps' | 'hats' | 'glasses' | 'other';
  imageUrl: string;
  gender: 'male' | 'female' | 'unisex';
  price?: number;
}

interface DatabaseSchema {
  tokens: Record<string, GHLTokens>; // keyed by locationId
  catalogs: Record<string, ClothingItem[]>; // keyed by locationId
}

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tokens: {}, catalogs: {} }, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON database:', err);
    return { tokens: {}, catalogs: {} };
  }
}

function writeDb(data: DatabaseSchema) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local JSON database:', err);
  }
}

export const db = {
  // Token methods
  saveTokens(locationId: string, tokens: GHLTokens) {
    const data = readDb();
    data.tokens[locationId] = tokens;
    writeDb(data);
  },

  getTokens(locationId: string): GHLTokens | null {
    const data = readDb();
    return data.tokens[locationId] || null;
  },

  // Clothing catalog methods
  saveCatalogItem(locationId: string, item: ClothingItem) {
    const data = readDb();
    if (!data.catalogs[locationId]) {
      data.catalogs[locationId] = [];
    }
    // Remove if exists
    data.catalogs[locationId] = data.catalogs[locationId].filter((i) => i.id !== item.id);
    data.catalogs[locationId].push(item);
    writeDb(data);
  },

  getCatalog(locationId: string): ClothingItem[] {
    const data = readDb();
    const catalog = data.catalogs[locationId] || [];
    if (catalog.length === 0) {
      // Return default seed data if empty
      return [
        // Jackets
        {
          id: 'seed-top-leather',
          title: 'Vintage Leather Jacket',
          category: 'jackets',
          imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 9999,
        },
        {
          id: 'seed-top-denim',
          title: 'Casual Denim Jacket',
          category: 'jackets',
          imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 3499,
        },
        {
          id: 'seed-jacket-bomber',
          title: 'Bomber Windbreaker',
          category: 'jackets',
          imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2799,
        },
        // Hoodies
        {
          id: 'seed-top-hoodie',
          title: 'Classic Cotton Hoodie',
          category: 'hoodies',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2499,
        },
        {
          id: 'seed-hoodie-zipper',
          title: 'Zipper Athletic Hoodie',
          category: 'hoodies',
          imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2299,
        },
        // Shirts
        {
          id: 'seed-top-shirt',
          title: 'White Summer Dress Shirt',
          category: 'shirts',
          imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
          gender: 'male',
          price: 1999,
        },
        {
          id: 'seed-shirt-flannel',
          title: 'Flannel Plaid Shirt',
          category: 'shirts',
          imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1699,
        },
        // T Shirts
        {
          id: 'seed-tshirt-organic',
          title: 'Premium Organic Tee',
          category: 't-shirts',
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 899,
        },
        {
          id: 'seed-tshirt-graphic',
          title: 'Graphic Urban Tee',
          category: 't-shirts',
          imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 999,
        },
        // Pants
        {
          id: 'seed-bottom-cargo',
          title: 'High-Waist Cargo Pants',
          category: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2799,
        },
        {
          id: 'seed-bottom-chinos',
          title: 'Slim-Fit Sand Chinos',
          category: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
          gender: 'male',
          price: 2499,
        },
        {
          id: 'seed-pants-structured',
          title: 'Structured Cargo Pants',
          category: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2799,
        },
        // Jeans
        {
          id: 'seed-bottom-jeans',
          title: 'Distressed Denim Jeans',
          category: 'jeans',
          imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2999,
        },
        {
          id: 'seed-jeans-slim',
          title: 'Slim Fit Dark Wash Jeans',
          category: 'jeans',
          imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df43c3?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 3199,
        },
        // Shorts
        {
          id: 'seed-shorts-linen',
          title: 'Summer Linen Shorts',
          category: 'shorts',
          imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1499,
        },
        {
          id: 'seed-shorts-sweat',
          title: 'Drawstring Sweatshorts',
          category: 'shorts',
          imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1299,
        },
        // Handbags
        {
          id: 'seed-handbag-saffiano',
          title: 'Saffiano Leather Handbag',
          category: 'handbags',
          imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
          gender: 'female',
          price: 12499,
        },
        {
          id: 'seed-handbag-tote',
          title: 'Canvas Tote Bag',
          category: 'handbags',
          imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1199,
        },
        // Shoulderbags
        {
          id: 'seed-shoulder-crossbody',
          title: 'Compact Crossbody Bag',
          category: 'shoulderbags',
          imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2299,
        },
        {
          id: 'seed-shoulder-messenger',
          title: 'Retro Leather Messenger Bag',
          category: 'shoulderbags',
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 4999,
        },
        // Caps
        {
          id: 'seed-caps-baseball',
          title: 'Distressed Baseball Cap',
          category: 'caps',
          imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 799,
        },
        {
          id: 'seed-caps-dad',
          title: 'Embroidered Dad Cap',
          category: 'caps',
          imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 699,
        },
        // Hats
        {
          id: 'seed-hats-straw',
          title: 'Wide Brim Straw Hat',
          category: 'hats',
          imageUrl: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?q=80&w=600&auto=format&fit=crop',
          gender: 'female',
          price: 1499,
        },
        {
          id: 'seed-hats-fedora',
          title: 'Wool Felt Fedora Hat',
          category: 'hats',
          imageUrl: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 3499,
        },
        // Glasses
        {
          id: 'seed-glasses-aviator',
          title: 'Retro Aviator Sunglasses',
          category: 'glasses',
          imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1899,
        },
        {
          id: 'seed-glasses-wayfarer',
          title: 'Classic Wayfarer Glasses',
          category: 'glasses',
          imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 1299,
        },
        // Other Legacy Categories
        {
          id: 'seed-top-sweater',
          title: 'Knit Turtleneck Sweater',
          category: 'tops',
          imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 2999,
        },
        {
          id: 'seed-bottom-trouser',
          title: 'Tailored Pleated Trousers',
          category: 'bottoms',
          imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 3999,
        },
        {
          id: 'seed-body-sari',
          title: 'Bengali Traditional Silk Sari',
          category: 'full-body',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
          gender: 'female',
          price: 8999,
        },
        {
          id: 'seed-body-dress',
          title: 'Linen Summer Wrap Dress',
          category: 'full-body',
          imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
          gender: 'female',
          price: 4499,
        },
        {
          id: 'seed-body-trench',
          title: 'Minimalist Camel Trench Coat',
          category: 'full-body',
          imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
          gender: 'unisex',
          price: 7999,
        },
      ];
    }
    return catalog;
  },

  deleteCatalogItem(locationId: string, itemId: string) {
    const data = readDb();
    if (data.catalogs[locationId]) {
      data.catalogs[locationId] = data.catalogs[locationId].filter((i) => i.id !== itemId);
      writeDb(data);
    }
  },
};
