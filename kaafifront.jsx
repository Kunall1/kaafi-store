import { useState, useEffect, useCallback } from "react";

/*
  KAAFI — Stooky.in Style
  
  - Full-screen hero with model photo + overlay text
  - Dark/black themed sections
  - Product cards: model-wearing images, hover zoom, quick-add
  - Marquee announcement bar
  - Collection banners
  - Minimal nav with hamburger + cart icon
  - Size chart integrated
  - Premium craft
*/

const SIZE_CHART = {
  measurements: ["Body Length", "Chest Width", "Sleeve Length", "Shoulder Width"],
  sizes: {
    S: ["22.25 in", "19.5 in", "7.5 in", "17.25 in"],
    M: ["22.75 in", "20.5 in", "7.5 in", "17.5 in"],
    L: ["23.25 in", "21.5 in", "8.1 in", "17.75 in"],
  },
};

const PRODUCTS = [
  {
    id: "crop-tee-black", name: "Cropped Tee", color: "Black",
    colorHex: "#111", price: 999, sizes: ["S", "M", "L"],
    description: "Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.",
    details: ["240 GSM french terry cotton", "Premium stitching", "Cropped relaxed fit", "Ribbed crew neck", "Made in India"],
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
  },
  {
    id: "crop-tee-white", name: "Cropped Tee", color: "White",
    colorHex: "#F2F2F0", price: 999, sizes: ["S", "M", "L"],
    description: "Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.",
    details: ["240 GSM french terry cotton", "Premium stitching", "Cropped relaxed fit", "Ribbed crew neck", "Made in India"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80",
    ],
  },
];

const css = document.createElement("style");
css.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Uncial+Antiqua&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Uncial Antiqua', cursive;
    background: #000;
    color: #fff;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  ::selection { background: #fff; color: #000; }
  ::-webkit-scrollbar { width: 0; }

  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(1.08); } to { transform: scale(1); } }

  .product-card {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    background: #111;
  }
  .product-card img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .product-card:hover img { transform: scale(1.06); }
  .product-card .quick-add {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: #fff; color: #000;
    text-align: center; padding: 14px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .product-card:hover .quick-add { transform: translateY(0); }

  .sz-btn {
    width: 52px; height: 52px; border: 1px solid #333;
    background: transparent; font-family: 'Uncial Antiqua', cursive;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: all 0.25s ease; display: flex;
    align-items: center; justify-content: center; color: #fff;
  }
  .sz-btn:hover { border-color: #fff; background: #1a1a1a; }
  .sz-btn.ac { background: #fff; color: #000; border-color: #fff; }

  .c-dot {
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; position: relative;
    transition: transform 0.3s ease;
    border: 2px solid #333;
  }
  .c-dot:hover { transform: scale(1.1); }
  .c-dot.ac { border-color: #fff; }

  .badge {
    position: absolute; top: -4px; right: -6px;
    min-width: 16px; height: 16px; background: #fff;
    color: #000; border-radius: 8px; font-size: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; padding: 0 3px;
  }

  input, textarea {
    width: 100%; padding: 16px 16px; border: 1px solid #333;
    background: #0a0a0a; font-family: 'Uncial Antiqua', cursive;
    font-size: 14px; font-weight: 400; color: #fff;
    outline: none; transition: border-color 0.3s ease;
  }
  input:focus, textarea:focus { border-color: #fff; }
  input::placeholder, textarea::placeholder { color: #555; }
  textarea { resize: none; min-height: 80px; }
`;
document.head.appendChild(css);

const LOGO = { fontFamily: "'Anton', sans-serif", fontWeight: 400 };
const HD = { fontFamily: "'Uncial Antiqua', cursive", fontWeight: 400 };

// ─── ANNOUNCEMENT BAR ──────────────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div style={{
      background: "#fff", color: "#000", overflow: "hidden",
      padding: "8px 0", position: "relative", zIndex: 50,
    }}>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "marquee 18s linear infinite",
      }}>
        {Array(10).fill(null).map((_, i) => (
          <span key={i} style={{
            fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
            fontWeight: 600, marginRight: 48,
          }}>
            FOUNDER'S DROP &nbsp;★&nbsp; NOW LIVE &nbsp;★&nbsp; KAAFI &nbsp;★&nbsp; CROP ESSENTIALS &nbsp;★&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ────────────────────────────────────────────────────────────────────
function Nav({ setPage, cc, onCart, dark = true }) {
  return (
    <nav style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
      padding: "16px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      {/* Hamburger */}
      <div style={{ cursor: "pointer", padding: 8 }} onClick={() => setPage("about")}>
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke={dark ? "#fff" : "#000"} strokeWidth="1.8">
          <line x1="0" y1="1" x2="24" y2="1"/><line x1="0" y1="8" x2="16" y2="8"/><line x1="0" y1="15" x2="24" y2="15"/>
        </svg>
      </div>

      {/* Logo */}
      <div onClick={() => setPage("home")} style={{
        cursor: "pointer", position: "absolute", left: "50%", transform: "translateX(-50%)",
      }}>
        <span style={{
          ...LOGO, fontSize: 28, letterSpacing: "0.04em",
          color: dark ? "#fff" : "#000",
        }}>KAAFI</span>
      </div>

      {/* Cart */}
      <div onClick={onCart} style={{ cursor: "pointer", padding: 8, position: "relative" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#000"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cc > 0 && <span className="badge">{cc}</span>}
      </div>
    </nav>
  );
}

// ─── HERO ───────────────────────────────────────────────────────────────────
function Hero({ setPage, onCart, cc }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 300); }, []);

  // Read the uploaded studio image as a data URL
  const [bgUrl, setBgUrl] = useState("");
  useEffect(() => {
    // Use the output path for the hero background
    setBgUrl("/mnt/user-data/outputs/hero-bg.png");
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <AnnouncementBar />
      <div style={{
        position: "relative", height: "100vh", overflow: "hidden",
        background: "#0a0a0a",
      }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} />

        {/* Dark studio background — CSS recreation of the uploaded image */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 50% 95%, rgba(255,255,255,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 30% 50% at 85% 0%, rgba(255,255,255,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 80% 50% at 50% 100%, rgba(180,180,180,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)
          `,
          opacity: v ? 1 : 0,
          transition: "opacity 1.5s ease",
        }} />

        {/* Subtle grain texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.5, pointerEvents: "none",
        }} />

        {/* Hero content — centered over the spotlight area */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 24px",
          zIndex: 2,
        }}>
          {/* Founder's Drop label */}
          <div style={{
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          }}>
            <p style={{
              fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase",
              fontWeight: 500, color: "rgba(255,255,255,0.35)", marginBottom: 24,
            }}>Founder's Drop — Now Live</p>
          </div>

          {/* Main headline */}
          <div style={{ overflow: "hidden" }}>
            <h1 style={{
              ...HD, fontSize: "clamp(52px, 12vw, 140px)",
              letterSpacing: "0.04em", lineHeight: 1,
              color: "#fff",
              textShadow: "0 4px 60px rgba(0,0,0,0.5)",
              transform: v ? "translateY(0)" : "translateY(110%)",
              transition: "transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}>
              CROP
            </h1>
          </div>
          <div style={{ overflow: "hidden", marginTop: -8 }}>
            <h1 style={{
              ...HD, fontSize: "clamp(52px, 12vw, 140px)",
              letterSpacing: "0.04em", lineHeight: 1,
              color: "#fff",
              textShadow: "0 4px 60px rgba(0,0,0,0.5)",
              transform: v ? "translateY(0)" : "translateY(110%)",
              transition: "transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
            }}>
              ESSENTIALS
            </h1>
          </div>

          {/* Thin line */}
          <div style={{
            width: 48, height: 1, background: "rgba(255,255,255,0.2)",
            margin: "28px 0",
            opacity: v ? 1 : 0, transform: v ? "scaleX(1)" : "scaleX(0)",
            transition: "all 0.8s ease 0.8s",
          }} />

          {/* Subtext */}
          <div style={{
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.8s ease 0.9s",
          }}>
            <p style={{
              fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)",
              maxWidth: 360, lineHeight: 1.7, marginBottom: 36,
              letterSpacing: "0.02em",
            }}>
              Cropped silhouettes crafted with intention.
              <br />No logos. No noise. Just the cut.
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: 14, alignItems: "center",
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.8s ease 1.1s",
          }}>
            <button onClick={() => setPage("shop")} style={{
              background: "#fff", color: "#000", border: "none",
              padding: "16px 44px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Uncial Antiqua', cursive",
              transition: "all 0.3s ease",
            }}>
              Shop Now
            </button>
          </div>
        </div>

        {/* Bottom fade for depth */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
          background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

// ─── MARQUEE SECTION ────────────────────────────────────────────────────────
function Marquee({ text, bg = "#111", color = "#fff" }) {
  return (
    <div style={{
      background: bg, overflow: "hidden", padding: "16px 0",
      borderTop: "1px solid #222", borderBottom: "1px solid #222",
    }}>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "marquee 14s linear infinite",
      }}>
        {Array(10).fill(null).map((_, i) => (
          <span key={i} style={{
            ...HD, fontSize: 28, letterSpacing: "0.02em",
            color, marginRight: 64, opacity: 0.8,
          }}>
            {text} &nbsp;★&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── COLLECTION BANNER ──────────────────────────────────────────────────────
function CollectionBanner({ setPage }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.2 });
    const el = document.getElementById("coll-banner");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div id="coll-banner" style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      minHeight: 500, background: "#000",
    }}>
      {/* Left — text */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px clamp(24px, 4vw, 64px)",
        opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-30px)",
        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <p style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          fontWeight: 500, color: "#666", marginBottom: 16,
        }}>The Collection</p>
        <h2 style={{
          ...HD, fontSize: "clamp(32px, 5vw, 64px)",
          letterSpacing: "0.03em", lineHeight: 1, marginBottom: 20,
        }}>
          FOUNDER'S<br />DROP
        </h2>
        <p style={{
          fontSize: 13, fontWeight: 400, color: "#888",
          lineHeight: 1.7, maxWidth: 320, marginBottom: 28,
        }}>
          Cropped silhouettes crafted with intention.
          Premium construction. Made in India.
        </p>
        <button onClick={() => setPage("shop")} style={{
          background: "#fff", color: "#000", border: "none",
          padding: "16px 36px", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "'Uncial Antiqua', cursive",
          alignSelf: "flex-start", transition: "all 0.3s ease",
        }}>
          Shop Collection
        </button>
      </div>

      {/* Right — image */}
      <div style={{
        overflow: "hidden",
        opacity: v ? 1 : 0,
        transition: "opacity 1.2s ease 0.2s",
      }}>
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
          alt="White Cropped Tee"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

// ─── PRODUCT GRID (HOME) ────────────────────────────────────────────────────
function ProductGrid({ setPage, setSel }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    const el = document.getElementById("prod-grid");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div id="prod-grid" style={{ background: "#000", padding: "64px 24px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 32, maxWidth: 1200, margin: "0 auto 32px",
      }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", fontWeight: 500, marginBottom: 8 }}>
            Shop
          </p>
          <h2 style={{ ...HD, fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "0.01em" }}>
            NEW ARRIVALS
          </h2>
        </div>
        <span onClick={() => setPage("shop")} style={{
          fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
          fontWeight: 600, color: "#888", cursor: "pointer",
          borderBottom: "1px solid #555", paddingBottom: 2,
        }}>View All</span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 4, maxWidth: 1200, margin: "0 auto",
      }}>
        {PRODUCTS.map((p, i) => (
          <div key={p.id} className="product-card"
            onClick={() => { setSel(p); setPage("product"); }}
            style={{
              aspectRatio: "3/4",
              opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.15}s`,
            }}>
            <img src={p.images[0]} alt={p.name} />
            <div className="quick-add">Quick Add</div>
            {/* Product info overlay */}
            <div style={{
              position: "absolute", bottom: 48, left: 0, right: 0,
              padding: "0 20px", zIndex: 2,
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name} — {p.color}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 700 }}>₹{p.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURES BAR ───────────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon: "✦", label: "Premium Craft", sub: "Every stitch intentional" },
    { icon: "◆", label: "Made in India", sub: "Homegrown quality" },
    { icon: "↔", label: "Easy Exchange", sub: "On size issues only" },
    { icon: "◈", label: "Secure Checkout", sub: "Razorpay protected" },
  ];
  return (
    <div style={{
      background: "#0a0a0a", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a",
      padding: "40px 24px",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      maxWidth: 1200, margin: "0 auto",
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>{it.icon}</p>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 4 }}>{it.label}</p>
          <p style={{ fontSize: 11, color: "#666", fontWeight: 400 }}>{it.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── HOME PAGE ──────────────────────────────────────────────────────────────
function Home({ setPage, setSel, onCart, cc }) {
  return (
    <div>
      <Hero setPage={setPage} onCart={onCart} cc={cc} />
      <Marquee text="FOUNDER'S DROP — CROP ESSENTIALS — KAAFI — PREMIUM CRAFT" />
      <ProductGrid setPage={setPage} setSel={setSel} />
      <CollectionBanner setPage={setPage} />
      <Marquee text="KAAFI — CRAFTED WITH INTENTION — MADE IN INDIA — CROP ESSENTIALS" bg="#fff" color="#000" />
      <Features />
    </div>
  );
}

// ─── SHOP PAGE ──────────────────────────────────────────────────────────────
function Shop({ setPage, setSel, onCart, cc }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <div style={{ position: "relative", padding: "80px 24px 24px" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} />

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ borderBottom: "1px solid #222", paddingBottom: 24, marginBottom: 32 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", fontWeight: 500, marginBottom: 8 }}>
              Founder's Drop
            </p>
            <h1 style={{ ...HD, fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "0.01em" }}>
              ALL PRODUCTS
            </h1>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
          }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} className="product-card"
                onClick={() => { setSel(p); setPage("product"); }}
                style={{
                  aspectRatio: "3/4",
                  opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)",
                  transition: `all 0.8s ease ${0.1 + i * 0.12}s`,
                }}>
                <img src={p.images[0]} alt={p.name} />
                <div className="quick-add">Quick Add</div>
                <div style={{ position: "absolute", bottom: 48, left: 0, right: 0, padding: "0 20px", zIndex: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.name} — {p.color}</p>
                  <p style={{ fontSize: 15, fontWeight: 700 }}>₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIZE GUIDE ─────────────────────────────────────────────────────────────
function SG({ open, onClose, sel }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 300, backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(460px, 90vw)", background: "#111", zIndex: 301, padding: "36px",
        border: "1px solid #222",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ ...HD, fontSize: 24, letterSpacing: "0.02em" }}>SIZE GUIDE</h3>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 20, color: "#666" }}>✕</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", fontWeight: 600 }}></th>
              {["S","M","L"].map(s=>(
                <th key={s} style={{
                  textAlign: "center", padding: "10px 8px", fontSize: 13, fontWeight: 600,
                  background: sel===s ? "#fff" : "transparent",
                  color: sel===s ? "#000" : "#fff",
                  transition: "all 0.3s ease",
                }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.measurements.map((m,i) => (
              <tr key={m} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "12px 8px", fontSize: 11, color: "#888" }}>{m}</td>
                {["S","M","L"].map(s=>(
                  <td key={s} style={{
                    textAlign: "center", padding: "12px 8px", fontSize: 12,
                    fontWeight: sel===s ? 700 : 400,
                    color: sel===s ? "#fff" : "#aaa",
                  }}>{SIZE_CHART.sizes[s][i]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{
          marginTop: 16, padding: "12px 14px", background: "#0a0a0a",
          border: "1px solid #1a1a1a",
        }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, textAlign: "center" }}>
            Note: All measurements may vary ±0.5 inch
          </p>
        </div>
      </div>
    </>
  );
}

// ─── PRODUCT PAGE ───────────────────────────────────────────────────────────
function Product({ product, addToCart, setPage, onCart, cc }) {
  const [sz, setSz] = useState(null);
  const [col, setCol] = useState(product.color);
  const [img, setImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [sg, setSg] = useState(false);
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  const cur = PRODUCTS.find(p => p.color === col) || product;

  const add = () => {
    if (!sz) return;
    addToCart({ ...cur, selectedSize: sz, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <SG open={sg} onClose={() => setSg(false)} sel={sz} />
      <div style={{ background: "#000", minHeight: "100vh" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} />

        <div style={{
          paddingTop: 64,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          maxWidth: 1200, margin: "0 auto",
        }}>
          {/* Images */}
          <div style={{
            opacity: v ? 1 : 0, transition: "opacity 0.8s ease",
          }}>
            <div style={{
              aspectRatio: "3/4", overflow: "hidden",
              background: cur.color === "Black" ? "#0a0a0a" : "#1a1a1a",
            }}>
              <img src={cur.images[img]} alt={cur.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }} />
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {cur.images.map((im, i) => (
                <div key={i} onClick={() => setImg(i)} style={{
                  width: 72, height: 90, overflow: "hidden", cursor: "pointer",
                  opacity: img === i ? 1 : 0.4, transition: "opacity 0.3s",
                  border: img === i ? "1px solid #fff" : "1px solid #222",
                }}>
                  <img src={im} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={{
            padding: "24px 0 24px 40px",
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.15s",
          }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", fontWeight: 500, marginBottom: 12 }}>
              Founder's Drop
            </p>
            <h1 style={{ ...HD, fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "0.01em", marginBottom: 8 }}>
              {cur.name.toUpperCase()} — {cur.color.toUpperCase()}
            </h1>
            <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>₹{cur.price}</p>
            <p style={{ fontSize: 11, color: "#555", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
              Tax included
            </p>

            <div style={{ height: 1, background: "#222", marginBottom: 24 }} />

            <p style={{ fontSize: 13, fontWeight: 400, color: "#888", lineHeight: 1.8, marginBottom: 28, maxWidth: 400 }}>
              {cur.description}
            </p>

            {/* Color */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600, color: "#666" }}>
                Color: <span style={{ color: "#fff" }}>{col}</span>
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {PRODUCTS.map(p => (
                  <div key={p.color} className={`c-dot ${col === p.color ? "ac" : ""}`}
                    onClick={() => { setCol(p.color); setImg(0); }}
                    style={{ background: p.colorHex }} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "#666" }}>
                  Size{sz && <span style={{ color: "#fff" }}>: {sz}</span>}
                </p>
                <span onClick={() => setSg(true)} style={{
                  fontSize: 10, letterSpacing: "0.02em", textTransform: "uppercase",
                  color: "#fff", cursor: "pointer", fontWeight: 500,
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}>Size Guide</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {cur.sizes.map(s => (
                  <button key={s} className={`sz-btn ${sz === s ? "ac" : ""}`}
                    onClick={() => setSz(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Inline measurements */}
            {sz && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
                marginBottom: 24, padding: "14px", background: "#111",
                border: "1px solid #222", animation: "fadeIn 0.3s ease",
              }}>
                {SIZE_CHART.measurements.map((m, i) => (
                  <div key={m}>
                    <p style={{ fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", fontWeight: 600, marginBottom: 4 }}>{m}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{SIZE_CHART.sizes[sz][i]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <button onClick={add} disabled={!sz} style={{
              width: "100%", padding: "18px",
              background: sz ? "#fff" : "#333", color: sz ? "#000" : "#666",
              border: "none", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: sz ? "pointer" : "not-allowed",
              fontFamily: "'Uncial Antiqua', cursive",
              transition: "all 0.3s ease",
            }}>
              {added ? "ADDED ✓" : sz ? "ADD TO BAG" : "SELECT A SIZE"}
            </button>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #1a1a1a" }}>
              {cur.details.map((d, i) => (
                <p key={i} style={{ fontSize: 11, fontWeight: 400, color: "#555", marginBottom: 5 }}>{d}</p>
              ))}
            </div>

            {/* Exchange Policy */}
            <div style={{
              marginTop: 20, padding: "16px", background: "#111",
              border: "1px solid #1a1a1a",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>🔄</span>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
                  Exchange Policy
                </p>
              </div>
              <p style={{ fontSize: 11, fontWeight: 400, color: "#666", lineHeight: 1.6 }}>
                No returns. Exchange available only for size issues.
                Please check the size guide before ordering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ABOUT ──────────────────────────────────────────────────────────────────
function About({ setPage, onCart, cc }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "120px 24px 80px" }}>
        <p style={{
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#555", fontWeight: 500, marginBottom: 16,
          opacity: v ? 1 : 0, transition: "opacity 0.6s ease",
        }}>Our Story</p>

        <h1 style={{
          ...HD, fontSize: "clamp(32px, 6vw, 64px)", letterSpacing: "0.04em",
          lineHeight: 0.95, marginBottom: 40,
          opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s ease 0.1s",
        }}>BUILT FROM<br />INTENTION</h1>

        {[
          "KAAFI started with a question — what if a brand only made what it truly believed in?",
          "The Founder's Drop is our first release. Two cropped tees. That's it. We didn't want to launch with a full collection. We wanted to launch with conviction.",
          "We spent months sourcing the right fabric, perfecting the cut, obsessing over every stitch. The kind of detail you feel the moment you put it on.",
          "Every decision was intentional. The crop length — not too short, not safe. Just right. No logos. No tags. The brand lives in the fit.",
          "KAAFI means 'enough.' That's the whole philosophy.",
        ].map((t, i) => (
          <p key={i} style={{
            fontSize: 14, fontWeight: 400, color: "#888", lineHeight: 1.8,
            marginBottom: 24,
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
            transition: `all 0.8s ease ${0.2 + i * 0.08}s`,
          }}>{t}</p>
        ))}
      </div>
    </div>
  );
}

// ─── CART DRAWER ─────────────────────────────────────────────────────────────
function CartDrawer({ cart, open, onClose, uq, ri, setPage }) {
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 200, opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none", transition: "opacity 0.3s ease",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(400px, 90vw)", background: "#0a0a0a",
        zIndex: 201, transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column",
        borderLeft: "1px solid #1a1a1a",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #1a1a1a",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ ...HD, fontSize: 18, letterSpacing: "0.02em" }}>YOUR BAG</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 18, color: "#666" }}>✕</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <p style={{ ...HD, fontSize: 20, marginBottom: 8, letterSpacing: "0.02em" }}>BAG IS EMPTY</p>
              <p style={{ fontSize: 12, color: "#555" }}>Add something to get started.</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, marginBottom: 20, paddingBottom: 20,
              borderBottom: "1px solid #1a1a1a",
            }}>
              <div style={{ width: 80, height: 100, overflow: "hidden", flexShrink: 0, background: "#111" }}>
                <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.name}</p>
                <p style={{ fontSize: 10, color: "#666", marginBottom: 6 }}>{item.color} / {item.selectedSize}</p>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>₹{item.price}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => uq(i, -1)} style={{
                    width: 28, height: 28, border: "1px solid #333", background: "transparent",
                    color: "#fff", cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>−</button>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 14, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => uq(i, 1)} style={{
                    width: 28, height: 28, border: "1px solid #333", background: "transparent",
                    color: "#fff", cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>+</button>
                  <span onClick={() => ri(i)} style={{
                    fontSize: 9, color: "#555", cursor: "pointer", marginLeft: "auto",
                    letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
                    textDecoration: "underline",
                  }}>Remove</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #1a1a1a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#666", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase" }}>Shipping</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Free</span>
            </div>
            <div style={{ height: 1, background: "#1a1a1a", margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>₹{total}</span>
            </div>
            <button onClick={() => { onClose(); setPage("checkout"); }} style={{
              width: "100%", padding: "18px", background: "#fff", color: "#000",
              border: "none", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Uncial Antiqua', cursive",
            }}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CHECKOUT ───────────────────────────────────────────────────────────────
function Checkout({ cart, setPage, setOD, onCart, cc }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [pr, setPr] = useState(false);
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const hc = k => e => setF({ ...f, [k]: e.target.value });

  const submit = () => {
    if (!f.name || !f.email || !f.phone || !f.address || !f.city || !f.pincode) return;
    setPr(true);
    setTimeout(() => {
      setOD({ orderId: "KAAFI-" + Date.now().toString(36).toUpperCase(), customer: f, items: cart, total,
        paymentId: "pay_" + Math.random().toString(36).substr(2, 14), timestamp: new Date().toISOString(), status: "confirmed" });
      setPr(false); setPage("confirm");
    }, 2000);
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} />
      <div style={{
        maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s ease",
      }}>
        <div>
          <h2 style={{ ...HD, fontSize: 32, letterSpacing: "0.02em", marginBottom: 36 }}>CHECKOUT</h2>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: "#555" }}>Contact</p>
          <input placeholder="Full Name" value={f.name} onChange={hc("name")} style={{ marginBottom: 8 }} />
          <input placeholder="Email" type="email" value={f.email} onChange={hc("email")} style={{ marginBottom: 8 }} />
          <input placeholder="Phone" type="tel" value={f.phone} onChange={hc("phone")} style={{ marginBottom: 24 }} />
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: "#555" }}>Shipping</p>
          <textarea placeholder="Address" value={f.address} onChange={hc("address")} style={{ marginBottom: 8 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="City" value={f.city} onChange={hc("city")} />
            <input placeholder="PIN Code" value={f.pincode} onChange={hc("pincode")} />
          </div>
          <button onClick={submit} disabled={pr} style={{
            width: "100%", marginTop: 28, padding: "18px",
            background: pr ? "#333" : "#fff", color: pr ? "#666" : "#000",
            border: "none", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: pr ? "not-allowed" : "pointer", fontFamily: "'Uncial Antiqua', cursive",
          }}>
            {pr ? "PROCESSING..." : `PAY ₹${total}`}
          </button>
          <p style={{ fontSize: 9, color: "#444", textAlign: "center", marginTop: 12, letterSpacing: "0.01em" }}>Secured by Razorpay</p>
        </div>

        <div style={{ padding: 28, background: "#0a0a0a", border: "1px solid #1a1a1a", alignSelf: "start" }}>
          <p style={{ ...HD, fontSize: 16, letterSpacing: "0.02em", marginBottom: 20 }}>ORDER SUMMARY</p>
          {cart.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ width: 48, height: 60, overflow: "hidden", background: "#111" }}>
                <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: 9, color: "#555" }}>{item.color} / {item.selectedSize} × {item.qty}</p>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700 }}>₹{item.price * item.qty}</p>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM ────────────────────────────────────────────────────────────────
function Confirm({ od, setPage }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  if (!od) return null;

  return (
    <div style={{
      background: "#000", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "80px 24px",
    }}>
      <div style={{
        textAlign: "center", maxWidth: 440,
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)",
        transition: "all 1s ease",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", border: "2px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 style={{ ...HD, fontSize: "clamp(32px, 6vw, 52px)", letterSpacing: "0.01em", marginBottom: 12 }}>THANK YOU</h1>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 32 }}>
          Order <strong style={{ color: "#fff" }}>{od.orderId}</strong><br />
          Confirmation → {od.customer.email}
        </p>
        <div style={{ textAlign: "left", padding: 24, background: "#0a0a0a", border: "1px solid #1a1a1a", marginBottom: 28 }}>
          {od.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: "#888" }}>
              <span>{item.name} — {item.color} / {item.selectedSize} × {item.qty}</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "#1a1a1a", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>₹{od.total}</span>
          </div>
        </div>
        <button onClick={() => setPage("home")} style={{
          background: "transparent", color: "#fff", border: "1px solid #333",
          padding: "16px 40px", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "'Uncial Antiqua', cursive",
        }}>Continue Shopping</button>
      </div>
    </div>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  const ft = { fontFamily: "'Uncial Antiqua', cursive" };
  return (
    <footer style={{ background: "#000", borderTop: "1px solid #1a1a1a", padding: "48px 24px 24px" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32,
      }}>
        <div>
          <span style={{ ...LOGO, fontSize: 24, letterSpacing: "0.04em", color: "#fff" }}>KAAFI</span>
          <p style={{ ...ft, fontSize: 12, color: "#444", marginTop: 10, lineHeight: 1.6 }}>
            The quietest thing you own.
          </p>
        </div>
        <div>
          <p style={{ ...ft, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, color: "#444" }}>Quick Links</p>
          {["home", "shop", "about"].map(p => (
            <p key={p} onClick={() => setPage(p)} style={{
              ...ft, fontSize: 12, color: "#666", marginBottom: 8, cursor: "pointer",
              transition: "color 0.2s ease",
            }}>{p.charAt(0).toUpperCase() + p.slice(1)}</p>
          ))}
        </div>
        <div>
          <p style={{ ...ft, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, color: "#444" }}>Follow Us</p>
          <a href="https://www.instagram.com/wearekaafi" target="_blank" rel="noopener noreferrer"
            style={{ ...ft, fontSize: 12, color: "#666", marginBottom: 8, display: "block", textDecoration: "none", transition: "color 0.2s ease", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = "#666"}
          >Instagram</a>
        </div>
      </div>
      <div style={{ height: 1, background: "#1a1a1a", margin: "36px 0 16px" }} />
      <p style={{ ...ft, textAlign: "center", fontSize: 10, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        © 2026 KAAFI · All Rights Reserved
      </p>
    </footer>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [pg, setPg] = useState("home");
  const [cart, setCart] = useState([]);
  const [co, setCo] = useState(false);
  const [sel, setSel] = useState(PRODUCTS[0]);
  const [od, setOD] = useState(null);

  const nav = useCallback(p => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setPg(p), 150);
  }, []);

  const addToCart = useCallback(item => {
    setCart(prev => {
      const i = prev.findIndex(c => c.id === item.id && c.selectedSize === item.selectedSize);
      if (i >= 0) { const u = [...prev]; u[i] = { ...u[i], qty: u[i].qty + 1 }; return u; }
      return [...prev, item];
    });
    setCo(true);
  }, []);

  const uq = useCallback((i, d) => {
    setCart(prev => { const u = [...prev]; u[i] = { ...u[i], qty: Math.max(1, u[i].qty + d) }; return u; });
  }, []);
  const ri = useCallback(i => setCart(prev => prev.filter((_, idx) => idx !== i)), []);
  const cc = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <div>
      <CartDrawer cart={cart} open={co} onClose={() => setCo(false)} uq={uq} ri={ri} setPage={nav} />
      {pg === "home" && <Home setPage={nav} setSel={setSel} onCart={() => setCo(true)} cc={cc} />}
      {pg === "shop" && <Shop setPage={nav} setSel={setSel} onCart={() => setCo(true)} cc={cc} />}
      {pg === "product" && <Product product={sel} addToCart={addToCart} setPage={nav} onCart={() => setCo(true)} cc={cc} />}
      {pg === "about" && <About setPage={nav} onCart={() => setCo(true)} cc={cc} />}
      {pg === "checkout" && <Checkout cart={cart} setPage={nav} setOD={setOD} onCart={() => setCo(true)} cc={cc} />}
      {pg === "confirm" && <Confirm od={od} setPage={nav} />}
      <Footer setPage={nav} />
    </div>
  );
}
