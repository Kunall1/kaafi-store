// ─── useProducts ─────────────────────────────────────────────────────────────
// Fetches all active products from Supabase.
// Returns { products, loading, error }.
//
// Usage:
//   import { useProducts } from '../hooks/useProducts';
//   const { products, loading, error } = useProducts();
//
// The DB uses snake_case (color_hex) but the frontend uses camelCase (colorHex).
// The transform() function handles that mapping so the rest of the app is unchanged.

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ── Fallback data ──────────────────────────────────────────────────────────────
// Used if Supabase is unreachable (e.g. no internet, cold start with bad creds).
// This keeps the site working even if the DB is down.
export const FALLBACK_PRODUCTS = [
  {
    id: 'crop-tee-black', name: 'Cropped Tee', color: 'Black',
    colorHex: '#111', price: 999, sizes: ['S', 'M', 'L'],
    description: 'Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.',
    details: ['240 GSM french terry cotton', 'Premium stitching', 'Cropped relaxed fit', 'Ribbed crew neck', 'Made in India'],
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
  },
  {
    id: 'crop-tee-white', name: 'Cropped Tee', color: 'White',
    colorHex: '#F2F2F0', price: 999, sizes: ['S', 'M', 'L'],
    description: 'Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.',
    details: ['240 GSM french terry cotton', 'Premium stitching', 'Cropped relaxed fit', 'Ribbed crew neck', 'Made in India'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80',
    ],
  },
];

// ── DB row → frontend object ──────────────────────────────────────────────────
// The only real change is color_hex → colorHex.
// Everything else is the same column name.
function transform(row) {
  return {
    id:          row.id,
    name:        row.name,
    color:       row.color,
    colorHex:    row.color_hex,     // snake_case → camelCase
    price:       row.price,
    sizes:       row.sizes  || [],
    description: row.description || '',
    details:     row.details || [],
    images:      row.images  || [],
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (sbError) throw sbError;

        if (!cancelled) {
          setProducts((data || []).map(transform));
          setError(null);
        }
      } catch (err) {
        console.error('[useProducts] fetch error:', err.message);
        if (!cancelled) {
          // Fall back to hardcoded products so the page still shows something
          setProducts(FALLBACK_PRODUCTS);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    // Cleanup: if the component unmounts before the fetch finishes,
    // don't try to update state (avoids React memory leak warning)
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
