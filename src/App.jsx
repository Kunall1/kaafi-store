import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { useProducts } from "./hooks/useProducts";
import AuthModal from "./components/AuthModal";
import { supabase } from "./lib/supabase";

// ─── ADMIN ───────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ["kaafi0117@gmail.com"];
const isAdmin = email => ADMIN_EMAILS.includes(email);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const BG   = "#F7F4EF";   // warm cream — main background
const BGA  = "#EDEAE3";   // slightly darker cream — cards, alternates
const SFC  = "#FFFFFF";   // pure white — elevated surfaces
const INK  = "#0f0f0f";   // near-black — primary text, CTAs
const INK2 = "#6b6560";   // warm grey — secondary text
const INK3 = "#a8a29c";   // light grey — captions, labels
const BDR  = "#DDD8D0";   // warm border
const BDR2 = "#C8C3BB";   // darker border

// ─── TYPOGRAPHY STYLES ───────────────────────────────────────────────────────
const JK    = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };
const SERIF = { ...JK, fontWeight: 800 };          // bold headlines
const SANS  = { ...JK, fontWeight: 400 };          // body text
const LOGO  = { ...JK, fontWeight: 800, letterSpacing: "0.18em" }; // wordmark

// ─── SIZE CHART DATA ─────────────────────────────────────────────────────────
const SIZE_CHART = {
  measurements: ["Length", "Chest", "Sleeve Length"],
  sizes: {
    S: ["22.25 in", "20.25 in", "7.5 in"],
    M: ["23.25 in", "21.25 in", "7.5 in"],
    L: ["24.25 in", "22.25 in", "7.5 in"],
  },
  note: "Sizes in inches · allow ±0.5\" variation",
};

// ─── ANNOUNCEMENT BAR ────────────────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div style={{ background: INK, color: BG, overflow: "hidden", padding: "9px 0", zIndex: 50 }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 22s linear infinite" }}>
        {Array(10).fill(null).map((_, i) => (
          <span key={i} style={{ ...SANS, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400, marginRight: 48 }}>
            Founder's Drop &nbsp;·&nbsp; Now Live &nbsp;·&nbsp; KAAFI &nbsp;·&nbsp; Crop Essentials &nbsp;·&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ setPage, cc, onCart, dark = false, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const fg = dark ? BG : INK;

  return (
    <nav style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
      padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      {/* Menu icon → About */}
      <div style={{ cursor: "pointer", padding: "4px 0" }} onClick={() => setPage("about")}>
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke={fg} strokeWidth="1.5">
          <line x1="0" y1="1"  x2="22" y2="1"/>
          <line x1="0" y1="7"  x2="14" y2="7"/>
          <line x1="0" y1="13" x2="22" y2="13"/>
        </svg>
      </div>

      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <span style={{ ...LOGO, fontSize: 22, color: fg, textTransform: "uppercase" }}>KAAFI</span>
      </div>

      {/* Right: user + cart */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            onClick={() => user ? setMenuOpen(m => !m) : onAuthClick?.()}
            style={{ cursor: "pointer", padding: "4px 8px", position: "relative" }}
            title={user ? user.email : "Sign in"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {user && (
              <span style={{ position: "absolute", top: 4, right: 6, width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
            )}
          </div>

          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              background: SFC, border: `1px solid ${BDR}`, minWidth: 180, zIndex: 100,
              animation: "fadeIn 0.15s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
            }}>
              <div style={{ padding: "10px 16px 8px", ...SANS, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK3, borderBottom: `1px solid ${BDR}` }}>
                {user.email}
              </div>
              {[
                { label: "My Orders", action: () => { setMenuOpen(false); setPage("orders"); }, color: INK },
                ...(isAdmin(user.email) ? [{ label: "Admin Dashboard", action: () => { setMenuOpen(false); setPage("admin"); }, color: INK }] : []),
                { label: "Sign Out",  action: () => { setMenuOpen(false); onSignOut?.(); },      color: "#c0392b" },
              ].map(({ label, action, color }) => (
                <div key={label} onClick={action} style={{
                  padding: "13px 16px", ...SANS, fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", fontWeight: 500, cursor: "pointer", color,
                  borderBottom: label === "My Orders" ? `1px solid ${BDR}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = BGA}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{label}</div>
              ))}
            </div>
          )}
        </div>

        <div onClick={onCart} style={{ cursor: "pointer", padding: "4px 8px", position: "relative" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 200); }, []);

  return (
    <div style={{ position: "relative" }}>
      <AnnouncementBar />
      <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />

        {/* Paper texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        }} />

        <div style={{ width: "100%", padding: "0 40px", zIndex: 2, maxWidth: 1200 }}>
          {/* Top label */}
          <p style={{
            ...SANS, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase",
            color: INK3, marginBottom: 28, fontWeight: 500,
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.7s ease 0.2s",
          }}>Founder's Drop — SS 2026</p>

          {/* Big wordmark */}
          <h1 style={{
            ...JK, fontWeight: 800,
            fontSize: "clamp(80px, 16vw, 200px)",
            letterSpacing: "-0.03em", lineHeight: 0.85, color: INK,
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(32px)",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.05s",
            textTransform: "uppercase",
          }}>
            Crop<br />
            <span style={{ fontWeight: 200, fontStyle: "italic" }}>Essentials</span>
          </h1>

          {/* Bottom row: tagline + CTA */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginTop: 48, flexWrap: "wrap", gap: 24,
            opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.8s ease 0.9s",
          }}>
            <p style={{ ...SANS, fontSize: 13, fontWeight: 300, color: INK2, lineHeight: 1.8, maxWidth: 280 }}>
              No logos. No noise.<br />Just the cut.
            </p>
            <button
              onClick={() => setPage("shop")}
              style={{ ...JK, background: INK, color: BG, border: "none", padding: "16px 56px", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "background 0.3s ease", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2a2a2a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = INK; }}
            >Shop Now</button>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(transparent, ${BG})`, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

// ─── MARQUEE SECTION ─────────────────────────────────────────────────────────
function MarqueeSection({ text, bg = INK, color = BG }) {
  return (
    <div style={{ background: bg, overflow: "hidden", padding: "16px 0" }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 18s linear infinite" }}>
        {Array(10).fill(null).map((_, i) => (
          <span key={i} style={{ ...JK, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color, marginRight: 48, fontWeight: 700 }}>
            {text} &nbsp;/
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
    <div id="coll-banner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 560, background: BGA }}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "64px clamp(32px, 5vw, 80px)",
        opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-20px)",
        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <p style={{ ...JK, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: INK3, fontWeight: 600, marginBottom: 20 }}>
          The Collection
        </p>
        <h2 style={{ ...JK, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.9, marginBottom: 24, color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          Founder's<br /><span style={{ fontWeight: 200, fontStyle: "italic", textTransform: "none" }}>Drop</span>
        </h2>
        <p style={{ ...SANS, fontSize: 13, fontWeight: 300, color: INK2, lineHeight: 1.85, maxWidth: 320, marginBottom: 36 }}>
          Cropped silhouettes crafted with intention. Premium construction. Made in India.
        </p>
        <button
          onClick={() => setPage("shop")}
          style={{ ...JK, background: INK, color: BG, border: "none", padding: "14px 36px", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start", transition: "background 0.3s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#2a2a2a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = INK; }}
        >Shop Collection</button>
      </div>
      <div style={{ overflow: "hidden", opacity: v ? 1 : 0, transition: "opacity 1.2s ease 0.2s" }}>
        <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" alt="White Cropped Tee"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

// ─── PRODUCT SKELETON ────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div style={{ aspectRatio: "3/4", background: BGA, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent 25%, ${SFC}80 50%, transparent 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite" }} />
      <div style={{ position: "absolute", bottom: 40, left: 20, right: 20 }}>
        <div style={{ height: 11, background: BDR, borderRadius: 2, marginBottom: 7, width: "52%" }} />
        <div style={{ height: 12, background: BDR, borderRadius: 2, width: "26%" }} />
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
    <div id="prod-grid" style={{ background: BG, padding: "80px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: 1200, margin: "0 auto 36px", borderBottom: `1px solid ${BDR}`, paddingBottom: 20 }}>
        <div>
          <p style={{ ...JK, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: INK3, fontWeight: 600, marginBottom: 8 }}>Shop</p>
          <h2 style={{ ...JK, fontSize: "clamp(28px, 4vw, 48px)", color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>New Arrivals</h2>
        </div>
        <span onClick={() => setPage("shop")} style={{ ...SANS, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500, color: INK2, cursor: "pointer", borderBottom: `1px solid ${BDR2}`, paddingBottom: 2 }}>
          View All
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, maxWidth: 1200, margin: "0 auto" }}>
        {loading
          ? [0, 1].map(i => <ProductSkeleton key={i} />)
          : products.map((p, i) => (
            <div key={p.id} className="product-card"
              onClick={() => { setSel(p); setPage("product"); }}
              style={{ aspectRatio: "3/4", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.15}s` }}>
              <img src={p.images[0]} alt={p.name} />
              <div className="quick-add">Quick Add</div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 22px", background: `linear-gradient(transparent, rgba(247,244,239,0.96))`, zIndex: 2 }}>
                <p style={{ ...JK, fontSize: 12, fontWeight: 700, marginBottom: 2, color: INK }}>{p.name} — {p.color}</p>
                <p style={{ ...JK, fontSize: 13, fontWeight: 400, color: INK2 }}>₹{p.price}</p>
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
    { icon: "✦", label: "Premium Craft",  sub: "Every stitch intentional" },
    { icon: "◆", label: "Made in India",  sub: "Homegrown quality"        },
    { icon: "↔", label: "Easy Exchange",  sub: "On size issues only"      },
    { icon: "◈", label: "Secure Checkout", sub: "Razorpay protected"      },
  ];
  return (
    <div style={{ background: SFC, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "48px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
      {items.map((it, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 10, color: INK }}>{it.icon}</p>
          <p style={{ ...SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, color: INK }}>{it.label}</p>
          <p style={{ ...SANS, fontSize: 11, color: INK3, fontWeight: 300 }}>{it.sub}</p>
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
      <MarqueeSection text="Founder's Drop — Crop Essentials — KAAFI — Premium Craft" />
      <ProductGrid setPage={setPage} setSel={setSel} products={products} loading={productsLoading} />
      <CollectionBanner setPage={setPage} />
      <MarqueeSection text="KAAFI — Crafted with Intention — Made in India" bg={BGA} color={INK} />
      <Features />
    </div>
  );
}

// ─── SHOP PAGE ───────────────────────────────────────────────────────────────
function Shop({ setPage, setSel, onCart, cc, onAuthClick, onSignOut, products, productsLoading }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <div style={{ position: "relative", padding: "88px 32px 40px" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ borderBottom: `1px solid ${BDR}`, paddingBottom: 24, marginBottom: 40 }}>
            <p style={{ ...JK, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: INK3, fontWeight: 600, marginBottom: 8 }}>Founder's Drop</p>
            <h1 style={{ ...JK, fontSize: "clamp(36px, 5vw, 64px)", color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>All Products</h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {productsLoading
              ? [0, 1].map(i => <ProductSkeleton key={i} />)
              : products.map((p, i) => (
                <div key={p.id} className="product-card"
                  onClick={() => { setSel(p); setPage("product"); }}
                  style={{ aspectRatio: "3/4", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `all 0.8s ease ${0.1 + i * 0.12}s` }}>
                  <img src={p.images[0]} alt={p.name} />
                  <div className="quick-add">Quick Add</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 22px", background: `linear-gradient(transparent, rgba(247,244,239,0.96))`, zIndex: 2 }}>
                    <p style={{ ...JK, fontSize: 12, fontWeight: 700, color: INK }}>{p.name} — {p.color}</p>
                    <p style={{ ...JK, fontSize: 13, fontWeight: 400, color: INK2 }}>₹{p.price}</p>
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.25)", zIndex: 300, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(480px, 90vw)", background: SFC, zIndex: 301, padding: "36px", border: `1px solid ${BDR}`, boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{ ...SERIF, fontSize: 26, color: INK, fontWeight: 400 }}>Size Guide</h3>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 16, color: INK3, ...SANS }}>✕</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BDR}` }}>
              <th style={{ textAlign: "left", padding: "10px 8px", ...SANS, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK3, fontWeight: 600 }}></th>
              {["S","M","L"].map(s => (
                <th key={s} style={{ textAlign: "center", padding: "10px 8px", ...SANS, fontSize: 13, fontWeight: 600, background: sel === s ? INK : "transparent", color: sel === s ? BG : INK, transition: "all 0.3s ease" }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.measurements.map((m, i) => (
              <tr key={m} style={{ borderBottom: `1px solid ${BDR}` }}>
                <td style={{ padding: "12px 8px", ...SANS, fontSize: 11, color: INK2 }}>{m}</td>
                {["S","M","L"].map(s => (
                  <td key={s} style={{ textAlign: "center", padding: "12px 8px", ...SANS, fontSize: 12, fontWeight: sel === s ? 600 : 400, color: sel === s ? INK : INK2 }}>{SIZE_CHART.sizes[s][i]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, padding: "12px 14px", background: BGA, border: `1px solid ${BDR}` }}>
          <p style={{ ...SANS, fontSize: 11, color: INK3, lineHeight: 1.5, textAlign: "center" }}>{SIZE_CHART.note}</p>
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
      <div style={{ background: BG, minHeight: "100vh" }}>
        <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
        <div style={{ paddingTop: 72, display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1200, margin: "0 auto" }}>
          {/* Images */}
          <div style={{ opacity: v ? 1 : 0, transition: "opacity 0.8s ease" }}>
            <div style={{ aspectRatio: "3/4", overflow: "hidden", background: BGA }}>
              <img src={cur.images[img]} alt={cur.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }} />
            </div>
            <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
              {cur.images.map((im, i) => (
                <div key={i} onClick={() => setImg(i)} style={{ width: 72, height: 90, overflow: "hidden", cursor: "pointer", opacity: img === i ? 1 : 0.4, transition: "opacity 0.3s", border: img === i ? `1px solid ${INK}` : `1px solid ${BDR}` }}>
                  <img src={im} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: "32px 0 32px 52px", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.15s" }}>
            <p style={{ ...JK, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: INK3, fontWeight: 600, marginBottom: 14 }}>Founder's Drop</p>
            <h1 style={{ ...JK, fontSize: "clamp(28px, 3.5vw, 48px)", marginBottom: 10, color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              {cur.name}<br /><span style={{ fontWeight: 200, fontStyle: "italic", textTransform: "none", fontSize: "0.75em" }}>{cur.color}</span>
            </h1>
            <p style={{ ...JK, fontSize: 24, fontWeight: 700, marginBottom: 4, color: INK }}>₹{cur.price}</p>
            <p style={{ ...JK, fontSize: 10, color: INK3, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: 28 }}>Tax included · Free shipping</p>

            <div style={{ height: 1, background: BDR, marginBottom: 24 }} />

            <p style={{ ...SANS, fontSize: 13, fontWeight: 300, color: INK2, lineHeight: 1.9, marginBottom: 28, maxWidth: 400 }}>{cur.description}</p>

            {/* Colour */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600, color: INK3 }}>
                Colour: <span style={{ color: INK }}>{col}</span>
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
                <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: INK3 }}>
                  Size{sz && <span style={{ color: INK }}>{`: ${sz}`}</span>}
                </p>
                <span onClick={() => setSg(true)} style={{ ...SANS, fontSize: 10, color: INK2, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Size Guide</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {cur.sizes.map(s => (
                  <button key={s} className={`sz-btn ${sz === s ? "ac" : ""}`} onClick={() => setSz(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Measurements */}
            {sz && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24, padding: "16px", background: SFC, border: `1px solid ${BDR}`, animation: "fadeIn 0.3s ease" }}>
                {SIZE_CHART.measurements.map((m, i) => (
                  <div key={m}>
                    <p style={{ ...SANS, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: INK3, fontWeight: 600, marginBottom: 4 }}>{m}</p>
                    <p style={{ ...SANS, fontSize: 13, fontWeight: 600, color: INK }}>{SIZE_CHART.sizes[sz][i]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <button onClick={add} disabled={!sz} style={{
              ...SANS, width: "100%", padding: "17px",
              background: sz ? INK : BGA, color: sz ? BG : INK3,
              border: "none", fontSize: 11, fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: sz ? "pointer" : "not-allowed", transition: "all 0.3s ease",
            }}>
              {added ? "Added ✓" : sz ? "Add to Bag" : "Select a Size"}
            </button>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BDR}` }}>
              {cur.details.map((d, i) => (
                <p key={i} style={{ ...SANS, fontSize: 11, fontWeight: 300, color: INK3, marginBottom: 5, lineHeight: 1.6 }}>{d}</p>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "16px", background: SFC, border: `1px solid ${BDR}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13 }}>🔄</span>
                <p style={{ ...SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: INK }}>Exchange Policy</p>
              </div>
              <p style={{ ...SANS, fontSize: 11, fontWeight: 300, color: INK2, lineHeight: 1.7 }}>
                No returns. Exchange available only for size issues. Please check the size guide before ordering.
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
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "120px 32px 80px" }}>
        <p style={{ ...SANS, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: INK3, fontWeight: 400, marginBottom: 20, opacity: v ? 1 : 0, transition: "opacity 0.6s ease" }}>
          Our Story
        </p>
        <h1 style={{ ...JK, fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 0.9, marginBottom: 48, color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease 0.1s" }}>
          Built from<br /><span style={{ fontWeight: 200, fontStyle: "italic", textTransform: "none" }}>Intention</span>
        </h1>
        {[
          "KAAFI started with a question — what if a brand only made what it truly believed in?",
          "The Founder's Drop is our first release. Two cropped tees. That's it. We didn't want to launch with a full collection. We wanted to launch with conviction.",
          "We spent months sourcing the right fabric, perfecting the cut, obsessing over every stitch. The kind of detail you feel the moment you put it on.",
          "Every decision was intentional. The crop length — not too short, not safe. Just right. No logos. No tags. The brand lives in the fit.",
          "KAAFI means 'enough.' That's the whole philosophy.",
        ].map((t, i) => (
          <p key={i} style={{ ...SANS, fontSize: 14, fontWeight: 300, color: INK2, lineHeight: 1.9, marginBottom: 24, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(10px)", transition: `all 0.8s ease ${0.2 + i * 0.08}s` }}>{t}</p>
        ))}
      </div>
    </div>
  );
}

// ─── CART DRAWER ─────────────────────────────────────────────────────────────
function CartDrawer({ cart, open, onClose, uq, ri, setPage, handleCheckout }) {
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.2)", zIndex: 200, opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none", transition: "opacity 0.3s ease", backdropFilter: open ? "blur(2px)" : "none" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(400px, 90vw)", background: SFC, zIndex: 201, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", borderLeft: `1px solid ${BDR}` }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BDR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...JK, fontSize: 14, color: INK, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>Your Bag</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 16, color: INK3, ...SANS }}>✕</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <p style={{ ...SERIF, fontSize: 22, marginBottom: 8, color: INK, fontWeight: 300 }}>Bag is Empty</p>
              <p style={{ ...SANS, fontSize: 12, color: INK3 }}>Add something to get started.</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${BDR}` }}>
              <div style={{ width: 80, height: 100, overflow: "hidden", flexShrink: 0, background: BGA }}>
                <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ ...SANS, fontSize: 12, fontWeight: 500, marginBottom: 2, color: INK }}>{item.name}</p>
                <p style={{ ...SANS, fontSize: 10, color: INK3, marginBottom: 8 }}>{item.color} / {item.selectedSize}</p>
                <p style={{ ...SANS, fontSize: 14, fontWeight: 600, marginBottom: 12, color: INK }}>₹{item.price}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[["−", -1], ["+", 1]].map(([label, delta]) => (
                    <button key={label} onClick={() => uq(i, delta)} style={{ width: 28, height: 28, border: `1px solid ${BDR}`, background: "transparent", color: INK, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{label}</button>
                  ))}
                  <span style={{ ...SANS, fontSize: 12, fontWeight: 600, minWidth: 14, textAlign: "center", color: INK }}>{item.qty}</span>
                  <span onClick={() => ri(i)} style={{ ...SANS, fontSize: 9, color: INK3, cursor: "pointer", marginLeft: "auto", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline" }}>Remove</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px 28px", borderTop: `1px solid ${BDR}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ ...SANS, fontSize: 10, color: INK3, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.06em" }}>Shipping</span>
              <span style={{ ...SANS, fontSize: 11, fontWeight: 500, color: INK }}>Free</span>
            </div>
            <div style={{ height: 1, background: BDR, margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ ...SANS, fontSize: 12, fontWeight: 600, color: INK }}>Total</span>
              <span style={{ ...SERIF, fontSize: 20, fontWeight: 400, color: INK }}>₹{total}</span>
            </div>
            <button onClick={() => { onClose(); handleCheckout(); }} style={{ ...SANS, width: "100%", padding: "17px", background: INK, color: BG, border: "none", fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
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
//  3. Razorpay modal opens
//  4. User pays → Razorpay calls handler() with payment_id + signature
//  5. We call /api/verify-payment (server) → verifies signature, sends email
//  6. We save order + items to Supabase (client, uses user's session)
//  7. Navigate to confirm page
function Checkout({ cart, setPage, setOD, onCart, cc, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [f, setF]     = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [pr, setPr]   = useState(false);
  const [err, setErr] = useState("");
  const [v, setV]     = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  useEffect(() => {
    if (user?.email) setF(prev => ({ ...prev, email: prev.email || user.email }));
  }, [user]);

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const hc    = k => e => setF({ ...f, [k]: e.target.value });

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s   = document.createElement("script");
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
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
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your connection.");

      const orderRes  = await fetch("/api/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, receipt: `kaafi_${Date.now()}` }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      orderData.amount,
          currency:    orderData.currency,
          order_id:    orderData.id,
          name:        "KAAFI",
          description: "Founder's Drop",
          prefill:     { name: f.name, email: f.email, contact: f.phone },
          theme:       { color: "#0f0f0f" },
          modal:       { ondismiss: () => reject(new Error("cancelled")) },

          handler: async (response) => {
            try {
              const verifyRes  = await fetch("/api/verify-payment", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  customer: f, items: cart, total,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

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
                  .select().single();

                if (orderErr) {
                  console.error("[checkout] DB error:", orderErr.message);
                } else if (order) {
                  await supabase.from("order_items").insert(
                    cart.map(item => ({
                      order_id: order.id, product_id: item.id,
                      product_name: item.name, color: item.color,
                      size: item.selectedSize, qty: item.qty, price: item.price,
                    }))
                  );
                }
              }

              setOD({ orderId: verifyData.orderId, customer: f, items: cart, total, paymentId: response.razorpay_payment_id, timestamp: new Date().toISOString(), status: "paid" });
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
      if (e.message !== "cancelled") setErr(e.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "100px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease" }}>
        <div>
          <h2 style={{ ...JK, fontSize: 36, color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: 36 }}>Checkout</h2>

          <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: INK3 }}>Contact</p>
          <input placeholder="Full Name"  value={f.name}  onChange={hc("name")}  style={{ marginBottom: 8 }} />
          <input placeholder="Email"      type="email" value={f.email} onChange={hc("email")} style={{ marginBottom: 8 }} />
          <input placeholder="Phone"      type="tel"   value={f.phone} onChange={hc("phone")} style={{ marginBottom: 28 }} />

          <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600, color: INK3 }}>Shipping</p>
          <textarea placeholder="Address" value={f.address} onChange={hc("address")} style={{ marginBottom: 8 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="City"     value={f.city}    onChange={hc("city")} />
            <input placeholder="PIN Code" value={f.pincode} onChange={hc("pincode")} />
          </div>

          {err && <p style={{ ...SANS, fontSize: 11, color: "#c0392b", marginTop: 12 }}>{err}</p>}

          <button onClick={submit} disabled={pr} style={{
            ...SANS, width: "100%", marginTop: 28, padding: "17px",
            background: pr ? BGA : INK, color: pr ? INK3 : BG,
            border: "none", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: pr ? "not-allowed" : "pointer", transition: "all 0.3s ease",
          }}>
            {pr ? "Opening Payment..." : `Pay ₹${total}`}
          </button>
          <p style={{ ...SANS, fontSize: 9, color: INK3, textAlign: "center", marginTop: 12, letterSpacing: "0.06em" }}>Secured by Razorpay</p>
        </div>

        <div style={{ padding: 28, background: SFC, border: `1px solid ${BDR}`, alignSelf: "start" }}>
          <p style={{ ...SERIF, fontSize: 18, color: INK, fontWeight: 400, marginBottom: 20 }}>Order Summary</p>
          {cart.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BDR}` }}>
              <div style={{ width: 48, height: 60, overflow: "hidden", background: BGA }}>
                <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ ...SANS, fontSize: 11, fontWeight: 500, color: INK }}>{item.name}</p>
                <p style={{ ...SANS, fontSize: 9, color: INK3 }}>{item.color} / {item.selectedSize} × {item.qty}</p>
              </div>
              <p style={{ ...SANS, fontSize: 12, fontWeight: 600, color: INK }}>₹{item.price * item.qty}</p>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
            <span style={{ ...SANS, fontSize: 13, fontWeight: 600, color: INK }}>Total</span>
            <span style={{ ...SERIF, fontSize: 18, fontWeight: 400, color: INK }}>₹{total}</span>
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
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 440, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: "all 1s ease" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", border: `1.5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ ...JK, fontSize: "clamp(36px, 6vw, 56px)", marginBottom: 12, color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Thank You</h1>
        <p style={{ ...SANS, fontSize: 13, color: INK2, lineHeight: 1.8, marginBottom: 36 }}>
          Order <strong style={{ color: INK }}>{od.orderId}</strong><br />
          Confirmation sent to {od.customer.email}
        </p>
        <div style={{ textAlign: "left", padding: 24, background: SFC, border: `1px solid ${BDR}`, marginBottom: 28 }}>
          {od.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, ...SANS, fontSize: 12, color: INK2 }}>
              <span>{item.name} — {item.color} / {item.selectedSize} × {item.qty}</span>
              <span style={{ color: INK, fontWeight: 600 }}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ height: 1, background: BDR, margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ ...SANS, fontSize: 13, fontWeight: 600, color: INK }}>Total</span>
            <span style={{ ...SERIF, fontSize: 18, color: INK }}>₹{od.total}</span>
          </div>
        </div>
        <button onClick={() => setPage("home")} style={{
          ...SANS, background: "transparent", color: INK, border: `1px solid ${BDR2}`,
          padding: "14px 40px", fontSize: 10, fontWeight: 500,
          letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
        }}>Continue Shopping</button>
      </div>
    </div>
  );
}

// ─── ORDERS PAGE ─────────────────────────────────────────────────────────────
function OrdersPage({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [v, setV]             = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[orders]", error.message);
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusStyle = s => ({
    paid:      { bg: "#e8f5e9", color: "#2e7d32" },
    shipped:   { bg: "#e3f2fd", color: "#1565c0" },
    delivered: { bg: "#f1f8e9", color: "#558b2f" },
    cancelled: { bg: "#fce4ec", color: "#c62828" },
    pending:   { bg: BGA,       color: INK3      },
  }[s] || { bg: BGA, color: INK3 });

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 32px 80px" }}>
        <p style={{ ...SANS, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: INK3, marginBottom: 16, opacity: v ? 1 : 0, transition: "opacity 0.6s ease" }}>Account</p>
        <h1 style={{ ...JK, fontSize: "clamp(28px, 5vw, 48px)", color: INK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: 40, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.1s" }}>My Orders</h1>

        {loading ? (
          <p style={{ ...SANS, fontSize: 12, color: INK3, textAlign: "center", padding: "60px 0" }}>Loading...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", opacity: v ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}>
            <p style={{ ...SERIF, fontSize: 22, marginBottom: 10, color: INK, fontWeight: 300 }}>No orders yet</p>
            <p style={{ ...SANS, fontSize: 12, color: INK3, marginBottom: 28 }}>Your orders will appear here once you shop.</p>
            <button onClick={() => setPage("shop")} style={{ ...SANS, background: INK, color: BG, border: "none", padding: "14px 32px", fontSize: 10, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Shop Now</button>
          </div>
        ) : (
          <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease 0.2s" }}>
            {orders.map(order => {
              const ss = statusStyle(order.status);
              return (
                <div key={order.id} style={{ marginBottom: 16, padding: "24px", background: SFC, border: `1px solid ${BDR}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <p style={{ ...SANS, fontSize: 13, fontWeight: 600, marginBottom: 4, color: INK, letterSpacing: "0.04em" }}>{order.order_number}</p>
                      <p style={{ ...SANS, fontSize: 10, color: INK3 }}>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...SANS, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", background: ss.bg, color: ss.color, display: "inline-block" }}>{order.status}</span>
                      <p style={{ ...SANS, fontSize: 16, fontWeight: 600, marginTop: 8, color: INK }}>₹{order.total}</p>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 12 }}>
                    {(order.order_items || []).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", ...SANS, fontSize: 11, color: INK2, marginBottom: 5 }}>
                        <span>{item.product_name} — {item.color} / {item.size} × {item.qty}</span>
                        <span style={{ color: INK, fontWeight: 500 }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ ...SANS, fontSize: 10, color: INK3, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BDR}` }}>
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

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard({ setPage, onCart, cc, onAuthClick, onSignOut }) {
  const { user } = useAuth();
  const [tab,        setTab]        = useState("orders");
  const [orders,     setOrders]     = useState([]);
  const [inventory,  setInventory]  = useState([]);
  const [adminProds, setAdminProds] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);

  // ── Data loaders ────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) console.error("[admin orders]", error.message);
    setOrders(data || []);
  };

  const fetchInventory = async () => {
    const [{ data: inv, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
      supabase.from("inventory").select("*").order("product_id"),
      supabase.from("products").select("id, name, color").order("name"),
    ]);
    if (e1) console.error("[admin inventory]", e1.message);
    if (e2) console.error("[admin products]",  e2.message);
    setInventory(inv   || []);
    setAdminProds(prods || []);
  };

  useEffect(() => {
    if (!user || !isAdmin(user.email)) return;
    Promise.all([fetchOrders(), fetchInventory()]).finally(() => setLoading(false));
  }, [user]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setUpdatingId(null);
  };

  const updateStock = async (productId, size, val) => {
    const stock = Math.max(0, parseInt(val) || 0);
    await supabase.from("inventory")
      .update({ stock, updated_at: new Date().toISOString() })
      .eq("product_id", productId).eq("size", size);
    setInventory(prev =>
      prev.map(it => it.product_id === productId && it.size === size ? { ...it, stock } : it)
    );
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const STATUS_OPTIONS = ["paid", "shipped", "delivered", "cancelled"];
  const statusStyle = s => ({
    paid:      { bg: "#e8f5e9", color: "#2e7d32" },
    shipped:   { bg: "#e3f2fd", color: "#1565c0" },
    delivered: { bg: "#f1f8e9", color: "#558b2f" },
    cancelled: { bg: "#fce4ec", color: "#c62828" },
    pending:   { bg: BGA,       color: INK3       },
  }[s] || { bg: BGA, color: INK3 });

  // ── Guard ───────────────────────────────────────────────────────────────────
  if (!user || !isAdmin(user.email)) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ ...SANS, fontSize: 13, color: INK3 }}>Access denied.</p>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Nav setPage={setPage} cc={cc} onCart={onCart} onAuthClick={onAuthClick} onSignOut={onSignOut} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 32px 80px", opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "all 0.8s ease" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${BDR}`, paddingBottom: 24, marginBottom: 36 }}>
          <div>
            <p style={{ ...SANS, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: INK3, marginBottom: 8 }}>Admin</p>
            <h1 style={{ ...SERIF, fontSize: "clamp(28px, 4vw, 48px)", color: INK, fontWeight: 300 }}>Dashboard</h1>
          </div>
          <p style={{ ...SANS, fontSize: 11, color: INK3 }}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ── Stats ── */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
            {[
              { label: "Total Orders",  value: orders.length },
              { label: "Revenue",       value: `₹${totalRevenue.toLocaleString("en-IN")}` },
              { label: "Shipped",       value: orders.filter(o => o.status === "shipped").length },
              { label: "Delivered",     value: orders.filter(o => o.status === "delivered").length },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "20px 24px", background: SFC, border: `1px solid ${BDR}` }}>
                <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK3, marginBottom: 10 }}>{label}</p>
                <p style={{ ...SERIF, fontSize: 30, color: INK, fontWeight: 400 }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BDR}`, marginBottom: 32 }}>
          {["orders", "inventory"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...SANS, padding: "12px 28px", fontSize: 10, letterSpacing: "0.16em",
              textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: tab === t ? `2px solid ${INK}` : "2px solid transparent",
              color: tab === t ? INK : INK3, marginBottom: -1, transition: "all 0.2s ease",
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ ...SANS, fontSize: 12, color: INK3, padding: "60px 0", textAlign: "center" }}>Loading...</p>

        ) : tab === "orders" ? (
          /* ════ ORDERS TAB ════ */
          <div>
            {orders.length === 0 ? (
              <p style={{ ...SANS, fontSize: 13, color: INK3, textAlign: "center", padding: "60px 0" }}>No orders yet.</p>
            ) : orders.map(order => {
              const sc = statusStyle(order.status);
              return (
                <div key={order.id} style={{ marginBottom: 10, padding: "20px 24px", background: SFC, border: `1px solid ${BDR}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                  {/* Left */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                      <p style={{ ...SANS, fontSize: 12, fontWeight: 600, color: INK, letterSpacing: "0.04em" }}>{order.order_number}</p>
                      <span style={{ ...SANS, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, padding: "3px 9px", background: sc.bg, color: sc.color }}>{order.status}</span>
                      <p style={{ ...SANS, fontSize: 10, color: INK3 }}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <p style={{ ...SANS, fontSize: 11, color: INK2, marginBottom: 3 }}>
                      {order.customer_name} &nbsp;·&nbsp; {order.customer_email} &nbsp;·&nbsp; {order.customer_phone}
                    </p>
                    <p style={{ ...SANS, fontSize: 10, color: INK3, marginBottom: 12 }}>
                      {order.shipping_address}, {order.shipping_city} — {order.shipping_pincode}
                    </p>
                    <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 8 }}>
                      {(order.order_items || []).map((item, i) => (
                        <p key={i} style={{ ...SANS, fontSize: 10, color: INK3, marginBottom: 3 }}>
                          {item.product_name} — {item.color} / {item.size} × {item.qty}
                          {" "}<span style={{ color: INK, fontWeight: 600 }}>₹{item.price * item.qty}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  {/* Right */}
                  <div style={{ textAlign: "right", minWidth: 148 }}>
                    <p style={{ ...SERIF, fontSize: 22, color: INK, marginBottom: 14 }}>₹{order.total.toLocaleString("en-IN")}</p>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{
                        ...SANS, fontSize: 10, padding: "8px 10px", width: "100%",
                        border: `1px solid ${BDR}`, background: SFC, color: INK,
                        cursor: "pointer", letterSpacing: "0.06em", outline: "none",
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <p style={{ ...SANS, fontSize: 9, color: INK3, marginTop: 5, letterSpacing: "0.06em" }}>Saving...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          /* ════ INVENTORY TAB ════ */
          <div>
            <p style={{ ...SANS, fontSize: 11, color: INK3, marginBottom: 24 }}>
              Click any number to change stock. 0 = sold out (shown in red).
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {adminProds.map(product => (
                <div key={product.id} style={{ padding: "24px", background: SFC, border: `1px solid ${BDR}` }}>
                  <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK3, marginBottom: 4 }}>Product</p>
                  <p style={{ ...SERIF, fontSize: 20, color: INK, fontWeight: 400, marginBottom: 2 }}>{product.name}</p>
                  <p style={{ ...SANS, fontSize: 11, color: INK2, marginBottom: 20 }}>{product.color}</p>

                  <div style={{ display: "flex", gap: 10 }}>
                    {["S", "M", "L"].map(size => {
                      const row   = inventory.find(i => i.product_id === product.id && i.size === size);
                      const stock = row?.stock ?? 0;
                      const soldOut = stock === 0;
                      return (
                        <div key={size} style={{ flex: 1, textAlign: "center" }}>
                          <p style={{ ...SANS, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK3, marginBottom: 6, fontWeight: 600 }}>{size}</p>
                          <input
                            type="number" min="0" value={stock}
                            onChange={e => updateStock(product.id, size, e.target.value)}
                            style={{
                              textAlign: "center", padding: "10px 4px", width: "100%",
                              border: `1px solid ${soldOut ? "#fca5a5" : BDR}`,
                              background: soldOut ? "#fef2f2" : SFC,
                              ...SANS, fontSize: 15, fontWeight: 600,
                              color: soldOut ? "#ef4444" : INK, outline: "none",
                            }}
                          />
                          {soldOut && (
                            <p style={{ ...SANS, fontSize: 8, color: "#ef4444", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sold Out</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background: INK, padding: "56px 32px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
        <div>
          <span style={{ ...LOGO, fontSize: 22, color: BG, textTransform: "uppercase" }}>KAAFI</span>
          <p style={{ ...SANS, fontSize: 12, color: "#666", marginTop: 12, lineHeight: 1.7, fontWeight: 300 }}>The quietest thing you own.</p>
        </div>
        <div>
          <p style={{ ...SANS, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, color: "#555", fontWeight: 500 }}>Quick Links</p>
          {["home", "shop", "about"].map(p => (
            <p key={p} onClick={() => setPage(p)} style={{ ...SANS, fontSize: 12, color: "#666", marginBottom: 10, cursor: "pointer", fontWeight: 300, transition: "color 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.color = BG}
              onMouseLeave={e => e.currentTarget.style.color = "#666"}
            >{p.charAt(0).toUpperCase() + p.slice(1)}</p>
          ))}
        </div>
        <div>
          <p style={{ ...SANS, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, color: "#555", fontWeight: 500 }}>Follow Us</p>
          <a href="https://www.instagram.com/wearekaafi" target="_blank" rel="noopener noreferrer"
            style={{ ...SANS, fontSize: 12, color: "#666", display: "block", textDecoration: "none", fontWeight: 300, transition: "color 0.2s ease" }}
            onMouseEnter={e => e.currentTarget.style.color = BG}
            onMouseLeave={e => e.currentTarget.style.color = "#666"}
          >Instagram</a>
        </div>
      </div>
      <div style={{ height: 1, background: "#1a1a1a", margin: "40px 0 20px" }} />
      <p style={{ ...SANS, textAlign: "center", fontSize: 9, color: "#3a3a3a", letterSpacing: "0.1em", textTransform: "uppercase" }}>© 2026 KAAFI · All Rights Reserved</p>
    </footer>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const { user, signOut }                      = useAuth();
  const { products, loading: productsLoading } = useProducts();

  const [pg, setPg]               = useState("home");
  const [cart, setCart]           = useState([]);
  const [co, setCo]               = useState(false);
  const [sel, setSel]             = useState(null);
  const [od, setOD]               = useState(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [afterAuth, setAfterAuth] = useState(null);

  useEffect(() => {
    if (products.length > 0 && !sel) setSel(products[0]);
  }, [products, sel]);

  const nav = useCallback(p => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setPg(p), 150);
  }, []);

  const handleCheckout = useCallback(() => {
    if (user) { nav("checkout"); }
    else { setAfterAuth(() => () => nav("checkout")); setShowAuth(true); }
  }, [user, nav]);

  const handleAuthSuccess = useCallback(() => {
    if (afterAuth) { afterAuth(); setAfterAuth(null); }
  }, [afterAuth]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    if (pg === "checkout" || pg === "orders") nav("home");
  }, [signOut, pg, nav]);

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

  const navProps = { setPage: nav, cc, onCart: () => setCo(true), onAuthClick: () => setShowAuth(true), onSignOut: handleSignOut };
  const productProps = { products, productsLoading };

  return (
    <div>
      <CartDrawer cart={cart} open={co} onClose={() => setCo(false)} uq={uq} ri={ri} setPage={nav} handleCheckout={handleCheckout} />

      {pg === "home"     && <Home     {...navProps} {...productProps} setSel={setSel} />}
      {pg === "shop"     && <Shop     {...navProps} {...productProps} setSel={setSel} />}
      {pg === "product"  && sel && <Product product={sel} addToCart={addToCart} products={products} {...navProps} />}
      {pg === "about"    && <About    {...navProps} />}
      {pg === "checkout" && <Checkout cart={cart} setPage={nav} setOD={setOD} {...navProps} />}
      {pg === "confirm"  && <Confirm  od={od} setPage={nav} />}
      {pg === "orders"   && user && <OrdersPage {...navProps} />}
      {pg === "admin"    && user && isAdmin(user.email) && <AdminDashboard {...navProps} />}

      <Footer setPage={nav} />

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAfterAuth(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
