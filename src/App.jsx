import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { useProducts } from "./hooks/useProducts";
import AuthModal from "./components/AuthModal";
import { supabase } from "./lib/supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SIZE_CHART = {
  measurements: ["Body Length", "Chest Width", "Sleeve Length", "Shoulder Width"],
  sizes: {
    S: ["22.25 in", "19.5 in", "7.5 in", "17.25 in"],
    M: ["22.75 in", "20.5 in", "7.5 in", "17.5 in"],
    L: ["23.25 in", "21.5 in", "8.1 in", "17.75 in"],
  },
};

// Products are now fetched from Supabase via useProducts() in the App root.
// The hardcoded fallback lives in src/hooks/useProducts.js → FALLBACK_PRODUCTS.

// Styles are in src/index.css

const LOGO = { fontFamily: "'Anton', sans-serif", fontWeight: 400 };
const HD = { fontFamily: "'Uncial Antiqua', cursive", fontWeight: 400 };

// ─── ANNOUNCEMENT BAR ────────────────────────────────────────────────────────
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
            FOUNDER&apos;S DROP &nbsp;★&nbsp; NOW LIVE &nbsp;★&nbsp; KAAFI &nbsp;★&nbsp; CROP ESSENTIALS &nbsp;★&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ setPage, cc, onCart, dark = true, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const stroke = dark ? "#fff" : "#000";

  return (
    <nav style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
      padding: "16px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      {/* Hamburger */}
      <div style={{ cursor: "pointer", padding: 8 }} onClick={() => setPage("about")}>
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke={stroke} strokeWidth="1.8">
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

      {/* Right side: User icon + Cart */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>

        {/* User icon */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            onClick={() => user ? setMenuOpen(m => !m) : onAuthClick?.()}
            style={{ cursor: "pointer", padding: 8, position: "relative" }}
            title={user ? user.email : "Sign in"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {/* Green dot when logged in */}
            {user && (
              <span style={{
                position: "absolute", top: 7, right: 7,
                width: 6, height: 6, borderRadius: "50%",
                background: "#22c55e",
                border: `1.5px solid ${dark ? "#0a0a0a" : "#fff"}`,
              }} />
            )}
          </div>

          {/* Dropdown menu (only when logged in) */}
          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)",
              background: "#0a0a0a", border: "1px solid #1e1e1e",
              minWidth: 170, zIndex: 100,
              animation: "fadeIn 0.15s ease",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}>
              {/* Logged in as */}
              <div style={{
                padding: "10px 16px 8px",
                fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#444", borderBottom: "1px solid #1a1a1a",
              }}>
                {user.email}
              </div>
              {/* My Orders */}
              <div
                onClick={() => { setMenuOpen(false); setPage("orders"); }}
                style={{
                  padding: "13px 16px", fontSize: 10, letterSpacing: "0.12em",
                  textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
                  color: "#fff", borderBottom: "1px solid #1a1a1a",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#111"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                My Orders
              </div>
              {/* Sign Out */}
              <div
                onClick={() => { setMenuOpen(false); onSignOut?.(); }}
                style={{
                  padding: "13px 16px", fontSize: 10, letterSpacing: "0.12em",
                  textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
                  color: "#e05252",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#111"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <div onClick={onCart} style={{ cursor: "pointer", padding: 8, position: "relative" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cc > 0 && <span className="badge">{cc}</span>}
        </div>

      </div>
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 300); }, []);

  return (
    <div style={{ position: "relative" }}>
      <AnnouncementBar />
      <div style={{
        position: "relative", height: "100vh", overflow: "hidden",
        background: "#0a0a0a",
      }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />

        {/* Dark studio background */}
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

        {/* Hero content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 24px",
          zIndex: 2,
        }}>
          <div style={{
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          }}>
            <p style={{
              fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase",
              fontWeight: 500, color: "rgba(255,255,255,0.35)", marginBottom: 24,
            }}>Founder&apos;s Drop — Now Live</p>
          </div>

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

          <div style={{
            width: 48, height: 1, background: "rgba(255,255,255,0.2)",
            margin: "28px 0",
            opacity: v ? 1 : 0, transform: v ? "scaleX(1)" : "scaleX(0)",
            transition: "all 0.8s ease 0.8s",
          }} />

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

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
          background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

// ─── MARQUEE SECTION ─────────────────────────────────────────────────────────
function MarqueeSection({ text, bg = "#111", color = "#fff" }) {
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

// ─── COLLECTION BANNER ───────────────────────────────────────────────────────
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
          FOUNDER&apos;S<br />DROP
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

// ─── PRODUCT SKELETON ────────────────────────────────────────────────────────
// Shown while products are loading from Supabase.
function ProductSkeleton() {
  return (
    <div style={{
      aspectRatio: "3/4", background: "#0d0d0d",
      animation: "pulse 1.6s ease-in-out infinite",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 25%, #1a1a1a 50%, transparent 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s infinite",
      }} />
      <div style={{
        position: "absolute", bottom: 48, left: 20, right: 20,
      }}>
        <div style={{ height: 13, background: "#1a1a1a", borderRadius: 2, marginBottom: 6, width: "60%" }} />
        <div style={{ height: 14, background: "#1a1a1a", borderRadius: 2, width: "30%" }} />
      </div>
    </div>
  );
}

// ─── PRODUCT GRID (HOME) ─────────────────────────────────────────────────────
function ProductGrid({ setPage, setSel, products = [], loading = false }) {
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
        maxWidth: 1200, margin: "0 auto 32px",
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
        {loading
          ? [0, 1].map(i => <ProductSkeleton key={i} />)
          : products.map((p, i) => (
            <div key={p.id} className="product-card"
              onClick={() => { setSel(p); setPage("product"); }}
              style={{
                aspectRatio: "3/4",
                opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.15}s`,
              }}>
              <img src={p.images[0]} alt={p.name} />
              <div className="quick-add">Quick Add</div>
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
          ))
        }
      </div>
    </div>
  );
}

// ─── FEATURES BAR ────────────────────────────────────────────────────────────
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

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function Home({ setPage, setSel, onCart, cc, onAuthClick, onSignOut, products, productsLoading }) {
  return (
    <div>
      <Hero setPage={setPage} onCart={onCart} cc={cc} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <MarqueeSection text="FOUNDER'S DROP — CROP ESSENTIALS — KAAFI — PREMIUM CRAFT" />
      <ProductGrid setPage={setPage} setSel={setSel} products={products} loading={productsLoading} />
      <CollectionBanner setPage={setPage} />
      <MarqueeSection text="KAAFI — CRAFTED WITH INTENTION — MADE IN INDIA — CROP ESSENTIALS" bg="#fff" color="#000" />
      <Features />
    </div>
  );
}

// ─── SHOP PAGE ───────────────────────────────────────────────────────────────
function Shop({ setPage, setSel, onCart, cc, onAuthClick, onSignOut, products, productsLoading }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <div style={{ position: "relative", padding: "80px 24px 24px" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ borderBottom: "1px solid #222", paddingBottom: 24, marginBottom: 32 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", fontWeight: 500, marginBottom: 8 }}>
              Founder&apos;s Drop
            </p>
            <h1 style={{ ...HD, fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "0.01em" }}>
              ALL PRODUCTS
            </h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {productsLoading
              ? [0, 1].map(i => <ProductSkeleton key={i} />)
              : products.map((p, i) => (
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
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIZE GUIDE MODAL ────────────────────────────────────────────────────────
function SizeGuide({ open, onClose, sel }) {
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
              {["S","M","L"].map(s => (
                <th key={s} style={{
                  textAlign: "center", padding: "10px 8px", fontSize: 13, fontWeight: 600,
                  background: sel === s ? "#fff" : "transparent",
                  color: sel === s ? "#000" : "#fff",
                  transition: "all 0.3s ease",
                }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.measurements.map((m, i) => (
              <tr key={m} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "12px 8px", fontSize: 11, color: "#888" }}>{m}</td>
                {["S","M","L"].map(s => (
                  <td key={s} style={{
                    textAlign: "center", padding: "12px 8px", fontSize: 12,
                    fontWeight: sel === s ? 700 : 400,
                    color: sel === s ? "#fff" : "#aaa",
                  }}>{SIZE_CHART.sizes[s][i]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, padding: "12px 14px", background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, textAlign: "center" }}>
            Note: All measurements may vary ±0.5 inch
          </p>
        </div>
      </div>
    </>
  );
}

// ─── PRODUCT PAGE ────────────────────────────────────────────────────────────
function Product({ product, addToCart, setPage, onCart, cc, onAuthClick, onSignOut, products = [] }) {
  const [sz, setSz] = useState(null);
  const [col, setCol] = useState(product.color);
  const [img, setImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [sg, setSg] = useState(false);
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  // Find the product matching the selected colour (for colour-swap on the detail page)
  const cur = products.find(p => p.color === col) || product;

  const add = () => {
    if (!sz) return;
    addToCart({ ...cur, selectedSize: sz, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <SizeGuide open={sg} onClose={() => setSg(false)} sel={sz} />
      <div style={{ background: "#000", minHeight: "100vh" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
        <div style={{
          paddingTop: 64,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          maxWidth: 1200, margin: "0 auto",
        }}>
          {/* Images */}
          <div style={{ opacity: v ? 1 : 0, transition: "opacity 0.8s ease" }}>
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
              Founder&apos;s Drop
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
                {products.map(p => (
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
            <div style={{ marginTop: 20, padding: "16px", background: "#111", border: "1px solid #1a1a1a" }}>
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

// ─── ABOUT ───────────────────────────────────────────────────────────────────
function About({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
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
// handleCheckout is passed from App so auth guard logic lives in one place.
function CartDrawer({ cart, open, onClose, uq, ri, setPage, handleCheckout }) {
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
            <button onClick={() => { onClose(); handleCheckout(); }} style={{
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

// ─── CHECKOUT ────────────────────────────────────────────────────────────────
// Phase 4: Real Razorpay payment flow
//
// Flow:
//  1. User fills form → clicks PAY
//  2. We call /api/create-order (server) → get Razorpay order_id
//  3. Razorpay modal opens (test card: 4111 1111 1111 1111, any future date, any CVV)
//  4. User pays → Razorpay calls handler() with payment_id + signature
//  5. We call /api/verify-payment (server) → verifies signature, sends email
//  6. We save order + items to Supabase (client, uses user's session)
//  7. Navigate to confirm page
function Checkout({ cart, setPage, setOD, onCart, cc, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [f, setF]   = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [pr, setPr] = useState(false);
  const [err, setErr] = useState("");
  const [v, setV]   = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email) setF(prev => ({ ...prev, email: prev.email || user.email }));
  }, [user]);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const hc    = k => e => setF({ ...f, [k]: e.target.value });

  // Dynamically load the Razorpay checkout script (only once)
  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s  = document.createElement("script");
    s.src    = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const submit = async () => {
    if (!f.name || !f.email || !f.phone || !f.address || !f.city || !f.pincode) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setPr(true);

    try {
      // ── Step 1: Load Razorpay JS ─────────────────────────────────────────
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your connection.");

      // ── Step 2: Create order on Vercel server ────────────────────────────
      const orderRes  = await fetch("/api/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: total, receipt: `kaafi_${Date.now()}` }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // ── Step 3: Open Razorpay modal ──────────────────────────────────────
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      orderData.amount,
          currency:    orderData.currency,
          order_id:    orderData.id,
          name:        "KAAFI",
          description: "Founder's Drop",
          prefill:     { name: f.name, email: f.email, contact: f.phone },
          theme:       { color: "#ffffff" },
          modal:       { ondismiss: () => reject(new Error("cancelled")) },

          handler: async (response) => {
            try {
              // ── Step 4: Verify signature on server ──────────────────────
              const verifyRes  = await fetch("/api/verify-payment", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  customer: f,
                  items:    cart,
                  total,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

              // ── Step 5: Save order to Supabase ──────────────────────────
              if (user) {
                const { data: order, error: orderErr } = await supabase
                  .from("orders")
                  .insert({
                    order_number:     verifyData.orderId,
                    user_id:          user.id,
                    customer_name:    f.name,
                    customer_email:   f.email,
                    customer_phone:   f.phone,
                    shipping_address: f.address,
                    shipping_city:    f.city,
                    shipping_pincode: f.pincode,
                    total,
                    payment_id:        response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    status:            "paid",
                  })
                  .select()
                  .single();

                if (orderErr) {
                  console.error("[checkout] DB order insert error:", orderErr.message);
                } else if (order) {
                  // Save line items (order_items table)
                  await supabase.from("order_items").insert(
                    cart.map(item => ({
                      order_id:     order.id,
                      product_id:   item.id,
                      product_name: item.name,
                      color:        item.color,
                      size:         item.selectedSize,
                      qty:          item.qty,
                      price:        item.price,
                    }))
                  );
                }
              }

              // ── Step 6: Set order data for confirmation page ─────────────
              setOD({
                orderId:   verifyData.orderId,
                customer:  f,
                items:     cart,
                total,
                paymentId: response.razorpay_payment_id,
                timestamp: new Date().toISOString(),
                status:    "paid",
              });
              resolve();
            } catch (e) { reject(e); }
          },
        });
        rzp.open();
      });

      setPr(false);
      setPage("confirm");

    } catch (e) {
      setPr(false);
      // "cancelled" means user closed the Razorpay modal — no error shown
      if (e.message !== "cancelled") {
        setErr(e.message || "Payment failed. Please try again.");
      }
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{
        maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
        opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s ease",
      }}>
        <div>
          <h2 style={{ ...HD, fontSize: 32, letterSpacing: "0.02em", marginBottom: 36 }}>CHECKOUT</h2>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: "#555" }}>Contact</p>
          <input placeholder="Full Name"  value={f.name}  onChange={hc("name")}  style={{ marginBottom: 8 }} />
          <input placeholder="Email"      type="email" value={f.email} onChange={hc("email")} style={{ marginBottom: 8 }} />
          <input placeholder="Phone"      type="tel"   value={f.phone} onChange={hc("phone")} style={{ marginBottom: 24 }} />
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: "#555" }}>Shipping</p>
          <textarea placeholder="Address" value={f.address} onChange={hc("address")} style={{ marginBottom: 8 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="City"     value={f.city}    onChange={hc("city")} />
            <input placeholder="PIN Code" value={f.pincode} onChange={hc("pincode")} />
          </div>
          {err && (
            <p style={{ fontSize: 11, color: "#e05252", marginTop: 14, letterSpacing: "0.01em" }}>{err}</p>
          )}
          <button onClick={submit} disabled={pr} style={{
            width: "100%", marginTop: 28, padding: "18px",
            background: pr ? "#333" : "#fff", color: pr ? "#666" : "#000",
            border: "none", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: pr ? "not-allowed" : "pointer", fontFamily: "'Uncial Antiqua', cursive",
            transition: "all 0.3s ease",
          }}>
            {pr ? "OPENING PAYMENT..." : `PAY ₹${total}`}
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

// ─── ORDER CONFIRMATION ──────────────────────────────────────────────────────
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

// ─── ORDERS PAGE ─────────────────────────────────────────────────────────────
// Shows the logged-in user's full order history from Supabase.
function OrdersPage({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) console.error("[orders] fetch error:", error.message);
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  const statusColor = s => ({
    paid:      { bg: "#14532d", color: "#4ade80" },
    shipped:   { bg: "#1e3a5f", color: "#60a5fa" },
    delivered: { bg: "#1a2e1a", color: "#86efac" },
    cancelled: { bg: "#2a1a1a", color: "#e05252" },
    pending:   { bg: "#1a1a1a", color: "#888" },
  }[s] || { bg: "#1a1a1a", color: "#888" });

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 24px 80px" }}>

        <p style={{
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#555", fontWeight: 500, marginBottom: 16,
          opacity: v ? 1 : 0, transition: "opacity 0.6s ease",
        }}>Account</p>

        <h1 style={{
          ...HD, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "0.01em", marginBottom: 40,
          opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.1s",
        }}>MY ORDERS</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 12, color: "#555", letterSpacing: "0.08em" }}>Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 0",
            opacity: v ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
          }}>
            <p style={{ ...HD, fontSize: 20, marginBottom: 10, letterSpacing: "0.02em" }}>NO ORDERS YET</p>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 28 }}>Your orders will appear here once you shop.</p>
            <button onClick={() => setPage("shop")} style={{
              background: "#fff", color: "#000", border: "none",
              padding: "14px 32px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "'Uncial Antiqua', cursive",
            }}>Shop Now</button>
          </div>
        ) : (
          <div style={{
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.2s",
          }}>
            {orders.map(order => {
              const sc = statusColor(order.status);
              return (
                <div key={order.id} style={{
                  marginBottom: 20, padding: "24px",
                  background: "#0a0a0a", border: "1px solid #1a1a1a",
                }}>
                  {/* Order header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, letterSpacing: "0.04em" }}>
                        {order.order_number}
                      </p>
                      <p style={{ fontSize: 10, color: "#444" }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                        fontWeight: 700, padding: "4px 10px",
                        background: sc.bg, color: sc.color,
                        display: "inline-block",
                      }}>{order.status}</span>
                      <p style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>₹{order.total}</p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 12 }}>
                    {(order.order_items || []).map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: 11, color: "#666", marginBottom: 6,
                      }}>
                        <span>{item.product_name} — {item.color} / {item.size} × {item.qty}</span>
                        <span style={{ color: "#aaa", fontWeight: 600 }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  <p style={{
                    fontSize: 10, color: "#333", marginTop: 12, paddingTop: 12,
                    borderTop: "1px solid #111", letterSpacing: "0.02em",
                  }}>
                    📦 {order.shipping_address}, {order.shipping_city} — {order.shipping_pincode}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
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
          <a
            href="https://www.instagram.com/wearekaafi"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...ft, fontSize: 12, color: "#666", marginBottom: 8, display: "block", textDecoration: "none", transition: "color 0.2s ease", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#666"}
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

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const { user, signOut }                    = useAuth();
  const { products, loading: productsLoading } = useProducts();

  const [pg, setPg]               = useState("home");
  const [cart, setCart]           = useState([]);
  const [co, setCo]               = useState(false);   // cart open
  const [sel, setSel]             = useState(null);    // selected product (set once products load)
  const [od, setOD]               = useState(null);    // order data
  const [showAuth, setShowAuth]   = useState(false);   // auth modal open
  const [afterAuth, setAfterAuth] = useState(null);    // action to run after login

  // Set initial product selection once products have loaded
  useEffect(() => {
    if (products.length > 0 && !sel) {
      setSel(products[0]);
    }
  }, [products, sel]);

  const nav = useCallback(p => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setPg(p), 150);
  }, []);

  // ── Auth guard for checkout ────────────────────────────────────────────────
  // If user is already logged in, go straight to checkout.
  // If not, open the auth modal and remember to go to checkout after login.
  const handleCheckout = useCallback(() => {
    if (user) {
      nav("checkout");
    } else {
      setAfterAuth(() => () => nav("checkout"));
      setShowAuth(true);
    }
  }, [user, nav]);

  const handleAuthSuccess = useCallback(() => {
    if (afterAuth) {
      afterAuth();
      setAfterAuth(null);
    }
  }, [afterAuth]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    if (pg === "checkout" || pg === "orders") nav("home");
  }, [signOut, pg, nav]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
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

  // ── Common Nav props ──────────────────────────────────────────────────────
  const navProps = {
    setPage:     nav,
    cc,
    onCart:      () => setCo(true),
    onAuthClick: () => setShowAuth(true),
    onSignOut:   handleSignOut,
  };

  // ── Common product props ───────────────────────────────────────────────────
  const productProps = {
    products,
    productsLoading,
  };

  return (
    <div>
      {/* Cart drawer */}
      <CartDrawer
        cart={cart} open={co}
        onClose={() => setCo(false)}
        uq={uq} ri={ri}
        setPage={nav}
        handleCheckout={handleCheckout}
      />

      {/* Pages */}
      {pg === "home"     && <Home     {...navProps} {...productProps} setSel={setSel} />}
      {pg === "shop"     && <Shop     {...navProps} {...productProps} setSel={setSel} />}
      {pg === "product"  && sel && <Product  product={sel} addToCart={addToCart} products={products} {...navProps} />}
      {pg === "about"    && <About    {...navProps} />}
      {pg === "checkout" && <Checkout cart={cart} setPage={nav} setOD={setOD} {...navProps} />}
      {pg === "confirm"  && <Confirm  od={od} setPage={nav} />}
      {pg === "orders"   && user && <OrdersPage {...navProps} />}

      <Footer setPage={nav} />

      {/* Auth modal — shown when user tries to checkout while logged out */}
      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAfterAuth(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
