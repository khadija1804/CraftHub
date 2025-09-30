// src/components/CompetitorModal.js
import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner'; // ajuste si ton spinner est ailleurs
import '../scarping.css';

/* ===============================
   Utils NLP & Stats (IA locale)
================================= */
const tokenize = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const bow = (tokens) => tokens.reduce((m, t) => (m.set(t, (m.get(t) || 0) + 1), m), new Map());

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  keys.forEach(k => {
    const x = a.get(k) || 0;
    const y = b.get(k) || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  });
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
};

const isNum = (v) => typeof v === 'number' && isFinite(v);

const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const quantile = (arr, q) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
};

const iqrBounds = (arr, k = 1.5) => {
  const q1 = quantile(arr, 0.25);
  const q3 = quantile(arr, 0.75);
  if (q1 == null || q3 == null) return { low: null, high: null, q1, q3 };
  const iqr = q3 - q1;
  return { low: q1 - k * iqr, high: q3 + k * iqr, q1, q3 };
};

const fmt = (val, currency = 'EUR') => {
  if (val == null) return 'Non détecté';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(val);
  } catch {
    return `${val} ${currency}`;
  }
};

const getDomain = (url = '') => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/* ===============================
   Composant principal
================================= */
export default function CompetitorModal({
  open,
  onClose,
  productName = '',
  currentPrice = null,      // optionnel : ton prix pour afficher l’écart vs médiane
  offers = [],              // [{ title, url, price|priceParsed }]
  isLoading = false,
  error = ''
}) {
  const dialogRef = useRef(null);

  // ---- IA: calculs (hooks TOUJOURS avant tout return conditionnel) ----
  const { ranked, band, insight } = useMemo(() => {
    // 1) Normaliser les offres
    const normalized = offers
      .map(o => {
        const priceRaw = o.price ?? o.priceParsed;
        const price = isNum(priceRaw) ? Number(priceRaw) : null;
        const title = String(o.title || '').trim();
        const url = String(o.url || '').trim();
        return { ...o, _price: price, _title: title, _url: url, _domain: getDomain(url) };
      })
      .filter(o => o._title || o._price != null);

    // 2) Similarité titre vs nom produit
    const bowName = bow(tokenize(productName || ''));
    const withSim = normalized.map(o => ({
      ...o,
      _sim: cosine(bowName, bow(tokenize(o._title || '')))
    }));

    // 3) Statistiques de prix
    const prices = withSim.map(o => o._price).filter(isNum);
    const med = median(prices);
    const { low, high, q1, q3 } = iqrBounds(prices);
    const min = prices.length ? Math.min(...prices) : null;
    const max = prices.length ? Math.max(...prices) : null;

    // 4) Proximité de la médiane (plus proche = mieux)
    const scale = (high != null && low != null) ? (high - low) : ((max != null && min != null) ? (max - min) : 1);
    const scored = withSim.map(o => {
      const prox = (med != null && isNum(o._price))
        ? (1 - Math.min(1, Math.abs(o._price - med) / Math.max(1, scale)))
        : 0;
      const score = 0.6 * (o._sim || 0) + 0.4 * prox;
      return {
        ...o,
        _prox: prox,
        _score: score,
        _outLow: (low != null && isNum(o._price)) ? o._price < low : false,
        _outHigh: (high != null && isNum(o._price)) ? o._price > high : false
      };
    });

    // 5) Tri décroissant
    const ranked = scored.sort((a, b) => (b._score || 0) - (a._score || 0));

    // 6) Fourchette de prix conseillée (médiane ±15% recoupée par [q1,q3])
    let lowBand = null, highBand = null;
    if (med != null) {
      const bLow = med * 0.85;
      const bHigh = med * 1.15;
      lowBand = q1 != null ? Math.max(bLow, q1) : bLow;
      highBand = q3 != null ? Math.min(bHigh, q3) : bHigh;
      if (lowBand > highBand) { // fallback
        lowBand = Math.min(bLow, bHigh);
        highBand = Math.max(bLow, bHigh);
      }
    }

    // 7) Insight lisible
    const outL = ranked.filter(o => o._outLow).length;
    const outH = ranked.filter(o => o._outHigh).length;
    const dmap = {};
    ranked.forEach(o => { if (o._domain) dmap[o._domain] = (dmap[o._domain] || 0) + 1; });
    const topDomain = Object.entries(dmap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const insightParts = [
      med != null ? `Médiane marché ~ ${fmt(med)}` : null,
      (min != null && max != null) ? `Min/Max: ${fmt(min)} – ${fmt(max)}` : null,
      (outL || outH) ? `Outliers: ${outL} bas / ${outH} hauts` : null,
      topDomain ? `Source fréquente: ${topDomain}` : null,
      (currentPrice != null && med != null)
        ? `Votre prix: ${fmt(currentPrice)} (${(100 * (currentPrice - med) / med).toFixed(1)}% vs médiane)`
        : null
    ].filter(Boolean);

    return {
      ranked,
      band: { low: lowBand, high: highBand },
      insight: insightParts.join(' • ')
    };
  }, [offers, productName, currentPrice]);

  // ---- Hooks d’effet (OK d’être après le useMemo tant qu’avant tout return conditionnel) ----
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // ---- Après TOUS les hooks : return conditionnel autorisé ----
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose?.();
  };

  const renderRow = (o, i) => (
    <div key={i} style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid rgba(138, 90, 68, 0.1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }} onMouseOver={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      e.currentTarget.style.borderColor = 'rgba(138, 90, 68, 0.2)';
    }} onMouseOut={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      e.currentTarget.style.borderColor = 'rgba(138, 90, 68, 0.1)';
    }}>
      {/* Decorative element */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
        borderRadius: '0 16px 0 60px',
        opacity: 0.1
      }}></div>

      {/* Header with title and domain */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ flex: 1, marginRight: '15px' }}>
          <h3 style={{
            fontSize: '1.1em',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 8px 0',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              color: '#8a5a44',
              fontSize: '1.2em'
            }}>📌</span>
            {o._title || 'Offre concurrente'}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <span style={{
              backgroundColor: 'rgba(138, 90, 68, 0.1)',
              color: '#8a5a44',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.85em',
              fontWeight: '600'
            }}>
              {o._domain || o.source || 'Source inconnue'}
            </span>
            {o._url && (
              <a 
                href={o._url} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔗 Voir l'offre
              </a>
            )}
          </div>
        </div>

        {/* Price badge */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '1.1em',
          fontWeight: '700',
          textAlign: 'center',
          minWidth: '100px',
          boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)'
        }}>
          {fmt(o._price)}
        </div>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '15px'
      }}>
        <div style={{
          backgroundColor: 'rgba(138, 90, 68, 0.05)',
          padding: '10px',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid rgba(138, 90, 68, 0.1)'
        }}>
          <div style={{
            fontSize: '0.8em',
            color: '#8a5a44',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Similarité
          </div>
          <div style={{
            fontSize: '1.2em',
            fontWeight: '700',
            color: '#2c3e50'
          }}>
            {(o._sim * 100).toFixed(0)}%
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          padding: '10px',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{
            fontSize: '0.8em',
            color: '#667eea',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Score IA
          </div>
          <div style={{
            fontSize: '1.2em',
            fontWeight: '700',
            color: '#2c3e50'
          }}>
            {(o._score * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Market position indicator */}
      {(o._outHigh || o._outLow) && (
        <div style={{
          backgroundColor: o._outHigh ? 'rgba(220, 53, 69, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: o._outHigh ? '#dc3545' : '#10b981',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.9em',
          fontWeight: '600',
          textAlign: 'center',
          border: `1px solid ${o._outHigh ? 'rgba(220, 53, 69, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '1.1em' }}>
            {o._outHigh ? '📈' : '📉'}
          </span>
          {o._outHigh ? 'Au-dessus du marché' : 'En dessous du marché'}
        </div>
      )}
    </div>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '2px solid rgba(138, 90, 68, 0.1)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            fontSize: '2em',
            boxShadow: '0 8px 20px rgba(138, 90, 68, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            🤖
          </div>
          <h3 style={{
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 10px 0'
          }}>
            Analyse concurrentielle en cours…
          </h3>
          <p style={{
            fontSize: '1.1em',
            color: '#5a6c7d',
            margin: '0 0 20px 0'
          }}>
            Notre IA analyse les prix du marché en temps réel
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#8a5a44',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#8a5a44',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.16s'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#8a5a44',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.32s'
            }}></div>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '2px solid rgba(220, 53, 69, 0.2)',
          boxShadow: '0 8px 25px rgba(220, 53, 69, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #dc3545, #ff6b7a)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            fontSize: '2em',
            boxShadow: '0 8px 20px rgba(220, 53, 69, 0.3)'
          }}>
            ⚠️
          </div>
          <h3 style={{
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#dc3545',
            margin: '0 0 10px 0'
          }}>
            Erreur d'analyse
          </h3>
          <p style={{
            fontSize: '1.1em',
            color: '#5a6c7d',
            margin: '0 0 20px 0'
          }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#c82333';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#dc3545';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      );
    }
    if (!offers || !offers.length) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '2px solid rgba(138, 90, 68, 0.1)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            fontSize: '2em',
            boxShadow: '0 8px 20px rgba(138, 90, 68, 0.3)'
          }}>
            🔍
          </div>
          <h3 style={{
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '0 0 10px 0'
          }}>
            Aucune offre trouvée
          </h3>
          <p style={{
            fontSize: '1.1em',
            color: '#5a6c7d',
            margin: '0 0 20px 0'
          }}>
            Aucune offre compétitive trouvée pour ce produit.
          </p>
          <div style={{
            backgroundColor: 'rgba(138, 90, 68, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            fontSize: '0.9em',
            color: '#8a5a44'
          }}>
            💡 Essayez de modifier le nom du produit pour une recherche plus large
          </div>
        </div>
      );
    }
    return (
      <div>
        {/* AI Analysis Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f1e9, #faf3e9)',
          border: '2px solid rgba(138, 90, 68, 0.2)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '25px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(138, 90, 68, 0.1)'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(20px)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #d4a373, #8a5a44)',
            borderRadius: '50%',
            opacity: 0.08,
            filter: 'blur(15px)'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5em',
                boxShadow: '0 8px 20px rgba(138, 90, 68, 0.3)'
              }}>
                🤖
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.4em',
                  fontWeight: '800',
                  color: '#2c3e50',
                  margin: '0 0 5px 0',
                  letterSpacing: '-0.02em'
                }}>
                  Assistant IA — Synthèse du marché
                </h3>
                <p style={{
                  fontSize: '0.9em',
                  color: '#8a5a44',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Analyse intelligente des prix concurrents
                </p>
              </div>
            </div>

            {/* Market insights */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid rgba(138, 90, 68, 0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                fontSize: '1.1em',
                color: '#5a6c7d',
                lineHeight: '1.6',
                margin: 0
              }}>
                {insight || 'En attente de données concurrentes…'}
              </div>
            </div>

            {/* Recommended price range */}
            {band.low != null && band.high != null && (
              <div style={{
                backgroundColor: 'rgba(138, 90, 68, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '2px solid rgba(138, 90, 68, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1em',
                  color: '#8a5a44',
                  fontWeight: '600',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>💡</span>
                  Fourchette de prix conseillée
                </div>
                <div style={{
                  fontSize: '1.8em',
                  fontWeight: '800',
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    backgroundColor: '#8a5a44',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)'
                  }}>
                    {fmt(band.low)}
                  </span>
                  <span style={{ color: '#8a5a44', fontSize: '1.2em' }}>—</span>
                  <span style={{
                    backgroundColor: '#8a5a44',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(138, 90, 68, 0.3)'
                  }}>
                    {fmt(band.high)}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.9em',
                  color: '#5a6c7d',
                  marginTop: '10px'
                }}>
                  Basé sur l'analyse de {ranked.length} offres concurrentes
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products list */}
        <div style={{
          marginTop: '10px'
        }}>
          <h4 style={{
            fontSize: '1.2em',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#8a5a44' }}>📊</span>
            Offres concurrentes analysées ({ranked.length})
          </h4>
          {ranked.map(renderRow)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="competitor-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease-out',
        padding: '20px'
      }}
    >
      <div 
        className="modal-content" 
        role="document" 
        tabIndex={-1} 
        ref={dialogRef}
        style={{
          backgroundColor: '#fff',
          borderRadius: '25px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideInUp 0.3s ease-out',
          border: '1px solid rgba(138, 90, 68, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8a5a44, #d4a373)',
          color: '#fff',
          padding: '25px 30px',
          borderRadius: '25px 25px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            filter: 'blur(15px)'
          }}></div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5em',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              🤖
            </div>
            <div>
              <h2 id="competitor-title" style={{ 
                margin: 0, 
                fontSize: '1.6em',
                fontWeight: '800',
                letterSpacing: '-0.02em'
              }}>
                Analyse concurrentielle (IA)
              </h2>
              <p style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                opacity: 0.9,
                fontWeight: '500'
              }}>
                Intelligence artificielle pour optimiser vos prix
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 20px',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              zIndex: 2
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            aria-label="Fermer la fenêtre"
          >
            ✕ Fermer
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '30px',
          overflow: 'auto',
          flex: 1,
          background: 'linear-gradient(135deg, #faf9f7, #f8f6f3)'
        }}>
          {renderBody()}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 
          40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

CompetitorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  productName: PropTypes.string,
  currentPrice: PropTypes.number,
  offers: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      priceParsed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};
