/**
 * DeckMind AI — Advanced Visual Generation, Diagram Suite & Luxury Design System
 * 
 * Generates cinematic 16:9 procedural vector diagrams, topic-aware architecture blueprints
 * (Docker VPS topology, CI/CD pipelines, Zero-Trust security, Metric Gauges, Neural Knowledge Web),
 * with 100% reliable direct Canvas-to-PNG rasterization for PowerPoint embedding.
 */

'use strict';

(function (root) {
  const DeckMindVisual = {};

  /* =========================================================================
   * 1. CURATED LUXURY DESIGN THEMES (Cream, White, Black, Light Pink Core)
   * ========================================================================= */
  DeckMindVisual.THEMES = {
    rose_cream: {
      id: 'rose_cream',
      name: 'Rose Cream Luxury (Editorial)',
      tagline: 'Warm luxury cream, crisp white cards, jet black text & blush pink accents',
      bg: '#FAF7F2',
      cardBg: '#FFFFFF',
      cardBorder: '#EAE5DD',
      accentPrimary: '#FB7185', // Blush Rose
      accentSecondary: '#FDA4AF', // Soft Pink
      accentHighlight: '#18181B', // Jet Black
      textPrimary: '#111111',
      textSecondary: '#52525B',
      textMuted: '#A1A1AA',
      badgeBg: '#FFF1F2',
      badgeText: '#BE185D',
      shadowColor: '#18181B'
    },
    noir_rose: {
      id: 'noir_rose',
      name: 'Noir & Blush Pink (Dark Mode)',
      tagline: 'Velvet black luxury with pure white typography & luminous light pink accents',
      bg: '#0C0A09',
      cardBg: '#18181B',
      cardBorder: '#27272A',
      accentPrimary: '#FB7185',
      accentSecondary: '#FDA4AF',
      accentHighlight: '#F43F5E',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      badgeBg: 'rgba(251, 113, 133, 0.15)',
      badgeText: '#FDA4AF',
      shadowColor: '#000000'
    },
    ivory_blush: {
      id: 'ivory_blush',
      name: 'Ivory & Ballet Pink',
      tagline: 'Soft ivory cream, pure white containers & delicate rose quartz highlights',
      bg: '#FDFBF7',
      cardBg: '#FFFFFF',
      cardBorder: '#F2ECE4',
      accentPrimary: '#F472B6',
      accentSecondary: '#FB7185',
      accentHighlight: '#18181B',
      textPrimary: '#18181B',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      badgeBg: '#FDF2F8',
      badgeText: '#DB2777',
      shadowColor: '#18181B'
    },
    monochrome_chic: {
      id: 'monochrome_chic',
      name: 'Monochrome & Rose Gold',
      tagline: 'Minimalist white & jet black with high-fashion light pink accents',
      bg: '#F4F4F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E4E4E7',
      accentPrimary: '#18181B',
      accentSecondary: '#FB7185',
      accentHighlight: '#FDA4AF',
      textPrimary: '#09090B',
      textSecondary: '#52525B',
      textMuted: '#71717A',
      badgeBg: '#FFF1F2',
      badgeText: '#BE185D',
      shadowColor: '#18181B'
    },
    editorial: {
      id: 'editorial',
      name: 'Warm Editorial (Thought Leadership)',
      tagline: 'Thought leadership with espresso, warm cream, terracotta & rose accents',
      bg: '#FAF7F2',
      cardBg: '#FFFFFF',
      cardBorder: '#E7E0D3',
      accentPrimary: '#C2410C',
      accentSecondary: '#FB7185',
      accentHighlight: '#18181B',
      textPrimary: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#A8A29E',
      badgeBg: '#FFF1F2',
      badgeText: '#BE185D',
      shadowColor: '#1C1917'
    },
    nordic: {
      id: 'nordic',
      name: 'Nordic Slate & Cobalt',
      tagline: 'Clean arctic slate white with deep navy & electric cobalt highlights',
      bg: '#F8FAFC',
      cardBg: '#FFFFFF',
      cardBorder: '#E2E8F0',
      accentPrimary: '#2563EB',
      accentSecondary: '#FB7185',
      accentHighlight: '#0F172A',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeText: '#2563EB',
      shadowColor: '#0F172A'
    }
  };

  /**
   * Get theme definition safely
   */
  DeckMindVisual.getTheme = function (themeId) {
    return DeckMindVisual.THEMES[themeId] || DeckMindVisual.THEMES.rose_cream;
  };

  /* =========================================================================
   * 2. DIRECT HTML5 CANVAS 2D RASTERIZER (Guaranteed 100% PNG Reliability)
   * ========================================================================= */

  function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 1.5, shadow = false, shadowColor = '#18181B') {
    ctx.save();
    if (shadow) {
      ctx.fillStyle = shadowColor;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, width, height, radius);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Direct Canvas Drawing: Dynamic Topic-Aware Multi-Tier System Architecture
   */
  function drawArchitectureOnCanvas(ctx, t, details, width, height) {
    const title = (details.title || details.app || 'Enterprise Strategic Architecture').toUpperCase();
    const tier1 = details.tier1 || '1. Interface & Ingress Gateway';
    const tier2 = details.tier2 || '2. Processing & Business Logic';
    const tier3 = details.tier3 || '3. State Persistence & Data Store';
    const tier4 = details.tier4 || '4. Telemetry & Analytics Hub';

    // Canvas Background
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, width, height);

    // Canvas Border
    ctx.strokeStyle = t.shadowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Top Header Bar
    drawRoundRect(ctx, 30, 24, width - 60, 48, 8, t.cardBg, t.shadowColor, 2, true, t.shadowColor);
    
    // Status Dots
    ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(55, 48, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(75, 48, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.arc(95, 48, 6, 0, Math.PI * 2); ctx.fill();

    // Header Title
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`SYSTEM TOPOLOGY // ${title.slice(0, 42)}`, 125, 53);

    // Active Status Pill
    drawRoundRect(ctx, width - 200, 32, 150, 32, 6, t.badgeBg, t.accentPrimary, 1.5);
    ctx.fillStyle = t.badgeText;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STATUS: VERIFIED', width - 125, 52);
    ctx.textAlign = 'left';

    // Main Boundary Container
    drawRoundRect(ctx, 40, 90, width - 80, height - 120, 10, t.cardBg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 40, 90, width - 80, 36, [10, 10, 0, 0], t.shadowColor, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('EXECUTION BOUNDARY [ Modular Orchestration • Zero-Trust Isolation • High Availability ]', 60, 114);

    // Tier 1: Ingress Gateway
    drawRoundRect(ctx, 70, 150, 240, 170, 8, t.cardBg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 70, 150, 240, 28, [8, 8, 0, 0], t.accentPrimary, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TIER 1: INGRESS & ROUTING', 85, 169);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 13.5px sans-serif';
    ctx.fillText(tier1.slice(0, 26), 85, 206);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '12px monospace';
    ctx.fillText('• Secure TLS Gateway', 85, 232);
    ctx.fillText('• Request Rate Limiting', 85, 254);
    ctx.fillText('• Input Schema Validation', 85, 276);
    ctx.fillText('• Edge Caching Layer', 85, 298);

    // Internal Mesh Network
    ctx.save();
    ctx.setLineDash([8, 6]);
    drawRoundRect(ctx, 350, 150, width - 420, height - 200, 8, t.cardBg, t.accentPrimary, 2);
    ctx.restore();

    drawRoundRect(ctx, 365, 160, 280, 26, 4, t.badgeBg, t.accentPrimary, 1);
    ctx.fillStyle = t.badgeText;
    ctx.font = 'bold 11.5px monospace';
    ctx.fillText('INTERNAL SERVICE MESH (ISOLATED)', 375, 178);

    // Container 1: App Service
    drawRoundRect(ctx, 380, 205, 260, 140, 8, t.bg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 380, 205, 260, 26, [8, 8, 0, 0], t.shadowColor, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TIER 2: CORE LOGIC', 400, 223);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(tier2.slice(0, 26), 395, 256);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '12px monospace';
    ctx.fillText('• Deterministic Execution', 395, 282);
    ctx.fillText('• Decoupled Async Handlers', 395, 304);
    ctx.fillText('• Zero-Trust Token Auth', 395, 326);

    // Container 2: Persistent Database
    drawRoundRect(ctx, 690, 205, 250, 140, 8, t.bg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 690, 205, 250, 26, [8, 8, 0, 0], t.accentPrimary, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TIER 3: PERSISTENCE', 710, 223);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(tier3.slice(0, 26), 705, 256);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '12px monospace';
    ctx.fillText('• Encrypted Data Storage', 705, 282);
    ctx.fillText('• Automated Point-in-Time Sync', 705, 304);
    ctx.fillText('• High-Throughput Indexing', 705, 326);

    // Container 3: State & Cache
    drawRoundRect(ctx, 380, 365, 260, 115, 8, t.bg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 380, 365, 260, 24, [8, 8, 0, 0], t.shadowColor, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText('STATE & CACHING', 400, 382);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('In-Memory State Hub', 395, 412);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '11.5px monospace';
    ctx.fillText('• Sub-millisecond Read Cache', 395, 436);
    ctx.fillText('• Real-time Event Streaming', 395, 458);

    // Container 4: Observability
    drawRoundRect(ctx, 690, 365, 250, 115, 8, t.bg, t.shadowColor, 2, true, t.shadowColor);
    drawRoundRect(ctx, 690, 365, 250, 24, [8, 8, 0, 0], t.accentPrimary, null);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText('TIER 4: OBSERVABILITY', 710, 382);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(tier4.slice(0, 26), 705, 412);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '11.5px monospace';
    ctx.fillText('• Unified Audit Logs', 705, 436);
    ctx.fillText('• Health & Latency Telemetry', 705, 458);

    // Host Hardening Badge (Bottom Left)
    drawRoundRect(ctx, 70, 340, 240, 140, 8, t.badgeBg, t.accentPrimary, 1.5, true, t.shadowColor);
    ctx.fillStyle = t.badgeText;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SECURITY ASSURANCES', 85, 368);
    ctx.fillStyle = t.textPrimary;
    ctx.font = '11.5px monospace';
    ctx.fillText('• Zero-Trust Network Policy', 85, 396);
    ctx.fillText('• TLS 1.3 Strict Encryption', 85, 418);
    ctx.fillText('• Least-Privilege Access', 85, 440);
    ctx.fillText('• Complete Verbatim Audit', 85, 462);

    // Connecting Lines
    ctx.strokeStyle = t.shadowColor;
    ctx.lineWidth = 3;
    // Ingress -> App
    ctx.beginPath(); ctx.moveTo(310, 235); ctx.lineTo(380, 235); ctx.stroke();
    // App -> DB
    ctx.beginPath(); ctx.moveTo(640, 275); ctx.lineTo(690, 275); ctx.stroke();
  }

  /**
   * Direct Canvas Drawing: Phased Execution Pipeline
   */
  function drawPipelineOnCanvas(ctx, t, details, width, height) {
    const title = details.title || 'Phased Implementation & Rollout Roadmap';
    const stages = (details.steps && details.steps.length >= 3) ? details.steps : [
      { step: '01', title: 'Phase 1: Architecture', desc: 'Confirm specifications, requirements, and design.' },
      { step: '02', title: 'Phase 2: Engineering', desc: 'Implement core modules, services, and APIs.' },
      { step: '03', title: 'Phase 3: Validation', desc: 'Execute automated tests, security, and benchmarking.' },
      { step: '04', title: 'Phase 4: Deployment', desc: 'Production release, telemetry, and enablement.' }
    ];

    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = t.shadowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Header
    drawRoundRect(ctx, 30, 24, width - 60, 65, 8, t.cardBg, t.shadowColor, 2, true, t.shadowColor);
    ctx.fillStyle = t.textPrimary;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(title.slice(0, 50), 55, 54);
    ctx.fillStyle = t.textSecondary;
    ctx.font = '12px monospace';
    ctx.fillText('EXECUTION PROTOCOL: PHASED MILESTONE DELIVERY & QUALITY GATES', 55, 76);

    const boxW = 210;
    const boxH = 280;
    const gap = 34;
    const startX = 48;
    const startY = 120;

    stages.slice(0, 4).forEach((st, idx) => {
      const x = startX + idx * (boxW + gap);
      drawRoundRect(ctx, x, startY, boxW, boxH, 10, t.cardBg, t.shadowColor, 2, true, t.shadowColor);
      drawRoundRect(ctx, x, startY, boxW, 34, [10, 10, 0, 0], idx % 2 === 0 ? t.shadowColor : t.accentPrimary, null);
      
      // Step badge
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x + 24, startY + 17, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t.shadowColor;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(st.step || `0${idx + 1}`, x + 24, startY + 21);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`STAGE ${idx + 1}`, x + 46, startY + 22);

      ctx.fillStyle = t.textPrimary;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText((st.title || `Milestone ${idx + 1}`).slice(0, 22), x + 16, startY + 72);

      ctx.strokeStyle = t.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + 16, startY + 86); ctx.lineTo(x + boxW - 16, startY + 86); ctx.stroke();

      ctx.fillStyle = t.textSecondary;
      ctx.font = '12px sans-serif';
      const desc = st.desc || '';
      ctx.fillText(desc.slice(0, 26), x + 16, startY + 115);
      ctx.fillText(desc.slice(26, 52), x + 16, startY + 135);
      ctx.fillText(desc.slice(52, 80), x + 16, startY + 155);

      drawRoundRect(ctx, x + 16, startY + boxH - 45, boxW - 32, 30, 6, t.badgeBg, t.accentPrimary, 1);
      ctx.fillStyle = t.badgeText;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED MILESTONE', x + boxW / 2, startY + boxH - 25);
      ctx.textAlign = 'left';

      if (idx < 3) {
        ctx.strokeStyle = t.shadowColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + boxW + 4, startY + boxH / 2);
        ctx.lineTo(x + boxW + gap - 4, startY + boxH / 2);
        ctx.stroke();
      }
    });
  }

  /**
   * Main Synchronous Canvas PNG Generator
   */
  DeckMindVisual.generateDiagramPng = function (diagramType, themeId = 'rose_cream', details = {}, width = 1000, height = 562) {
    const t = DeckMindVisual.getTheme(themeId);
    
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const type = (diagramType || '').toLowerCase();
        if (type.includes('pipeline') || type.includes('ci/cd') || type.includes('timeline') || type.includes('roadmap')) {
          drawPipelineOnCanvas(ctx, t, details, width, height);
        } else {
          drawArchitectureOnCanvas(ctx, t, details, width, height);
        }
        return canvas.toDataURL('image/png');
      }
    }
    return '';
  };

  function escapeXml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Smart Topic Router: Selects the most contextual vector diagram SVG for Studio Canvas preview
   */
  DeckMindVisual.getTopicAwareDiagramSVG = function (topicOrTitle = '', theme = 'rose_cream', details = {}, width = 1000, height = 562) {
    const t = DeckMindVisual.getTheme(theme);
    const title = escapeXml(topicOrTitle || details.title || 'Enterprise System Architecture');
    const type = (details.type || topicOrTitle || '').toLowerCase();

    if (type.includes('timeline') || type.includes('roadmap') || type.includes('phase')) {
      return DeckMindVisual.generateProcessFlowSVG(theme, details.steps, width, height);
    }
    if (type.includes('metric') || type.includes('kpi')) {
      return DeckMindVisual.generateMetricGaugesSVG(theme, details.metrics, width, height);
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" rx="10" fill="${t.bg}" stroke="${t.shadowColor}" stroke-width="2"/>
        <rect x="25" y="20" width="${width - 50}" height="42" rx="8" fill="${t.cardBg}" stroke="${t.shadowColor}" stroke-width="1.5"/>
        <text x="45" y="46" fill="${t.textPrimary}" font-family="monospace" font-size="13" font-weight="bold">SYSTEM TOPOLOGY // ${title.slice(0, 42)}</text>
        <rect x="35" y="80" width="${width - 70}" height="${height - 105}" rx="10" fill="${t.cardBg}" stroke="${t.shadowColor}" stroke-width="2"/>
        <rect x="35" y="80" width="${width - 70}" height="30" rx="10" fill="${t.shadowColor}"/>
        <text x="55" y="101" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">OPERATIONAL BOUNDARY [ Modular Architecture • High Availability • Zero-Trust ]</text>
        <rect x="65" y="130" width="220" height="150" rx="8" fill="${t.cardBg}" stroke="${t.shadowColor}" stroke-width="1.5"/>
        <text x="80" y="170" fill="${t.textPrimary}" font-family="sans-serif" font-size="13" font-weight="bold">Ingress &amp; Gateway</text>
        <text x="80" y="195" fill="${t.textSecondary}" font-family="monospace" font-size="11">• TLS 1.3 Strict Encryption</text>
        <text x="80" y="215" fill="${t.textSecondary}" font-family="monospace" font-size="11">• Authentication Layer</text>
        <text x="80" y="235" fill="${t.textSecondary}" font-family="monospace" font-size="11">• Rate Limiting &amp; Guard</text>
        <rect x="325" y="130" width="${width - 390}" height="${height - 180}" rx="8" fill="${t.cardBg}" stroke="${t.accentPrimary}" stroke-width="1.5" stroke-dasharray="6,4"/>
        <rect x="365" y="175" width="250" height="125" rx="8" fill="${t.bg}" stroke="${t.shadowColor}" stroke-width="1.5"/>
        <text x="380" y="210" fill="${t.textPrimary}" font-family="sans-serif" font-size="13" font-weight="bold">Core Execution Engine</text>
        <text x="380" y="232" fill="${t.textSecondary}" font-family="monospace" font-size="11">• Decoupled Service Logic</text>
        <text x="380" y="252" fill="${t.textSecondary}" font-family="monospace" font-size="11">• Real-Time Processing</text>
        <rect x="670" y="175" width="240" height="125" rx="8" fill="${t.bg}" stroke="${t.shadowColor}" stroke-width="1.5"/>
        <text x="685" y="210" fill="${t.textPrimary}" font-family="sans-serif" font-size="13" font-weight="bold">Data Persistence</text>
        <text x="685" y="232" fill="${t.textSecondary}" font-family="monospace" font-size="11">• Encrypted State Storage</text>
        <text x="685" y="252" fill="${t.textSecondary}" font-family="monospace" font-size="11">• High-Throughput Index</text>
      </svg>
    `;
  };

  /**
   * Convert SVG String to Base64 Data URL
   */
  DeckMindVisual.svgToDataUrl = function (svgString) {
    if (typeof btoa !== 'undefined') {
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
  };

  /* =========================================================================
   * 3. STABLE DIFFUSION / SDXL PROMPT SYNTHESIZER
   * ========================================================================= */
  DeckMindVisual.buildDiffusionPrompt = function (slideTitle, slideTheme, slideType) {
    const t = DeckMindVisual.getTheme(slideTheme);
    return `Masterpiece, professional enterprise presentation diagram representing "${slideTitle}", warm luxury cream and white background, crisp ink lineart, delicate blush pink rose accents, clean isometric vector art, high contrast, 8k resolution, award winning technical layout.`;
  };

  /* =========================================================================
   * 4. SVG PREVIEW GENERATORS (Used by Deck Studio Inspector Visuals Tab)
   * ========================================================================= */

  /**
   * Generate Neural Knowledge Web SVG preview
   */
  DeckMindVisual.generateNeuralWebSVG = function (themeId, width = 300, height = 170) {
    const t = DeckMindVisual.getTheme(themeId);
    const cx = width / 2;
    const cy = height / 2;

    const nodes = [
      { x: cx, y: cy - 45, label: 'Core' },
      { x: cx - 75, y: cy - 10, label: 'Entity A' },
      { x: cx + 75, y: cy - 10, label: 'Entity B' },
      { x: cx - 55, y: cy + 40, label: 'Insight' },
      { x: cx + 55, y: cy + 40, label: 'Context' },
      { x: cx, y: cy + 55, label: 'Bridge' }
    ];

    const edges = [
      [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2]
    ];

    let edgesSvg = edges.map(([a, b]) =>
      `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="${t.cardBorder}" stroke-width="1.5" stroke-dasharray="4,3"/>`
    ).join('');

    let nodesSvg = nodes.map((n, i) => `
      <circle cx="${n.x}" cy="${n.y}" r="${i === 0 ? 18 : 13}" fill="${i === 0 ? t.accentPrimary : t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <text x="${n.x}" y="${n.y + 3}" fill="${i === 0 ? '#FFFFFF' : t.textPrimary}" font-family="sans-serif" font-size="${i === 0 ? 7 : 6}" font-weight="bold" text-anchor="middle">${escapeXml(n.label)}</text>
    `).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="8" fill="${t.bg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="12" y="16" fill="${t.textMuted || t.textSecondary}" font-family="monospace" font-size="8" font-weight="bold">NEURAL KNOWLEDGE WEB</text>
      ${edgesSvg}
      ${nodesSvg}
    </svg>`;
  };

  /**
   * Generate Architecture Blueprint SVG preview
   */
  DeckMindVisual.generateArchitectureBlueprintSVG = function (themeId, width = 300, height = 170) {
    const t = DeckMindVisual.getTheme(themeId);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="8" fill="${t.bg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="12" y="16" fill="${t.textMuted || t.textSecondary}" font-family="monospace" font-size="8" font-weight="bold">SYSTEM BLUEPRINT</text>

      <!-- Ingress Layer -->
      <rect x="15" y="28" width="80" height="50" rx="6" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <rect x="15" y="28" width="80" height="5" rx="3" fill="${t.accentPrimary}"/>
      <text x="55" y="50" fill="${t.textPrimary}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">Ingress</text>
      <text x="55" y="62" fill="${t.textSecondary}" font-family="monospace" font-size="6" text-anchor="middle">Nginx + TLS</text>

      <!-- App Layer -->
      <rect x="110" y="28" width="80" height="50" rx="6" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <rect x="110" y="28" width="80" height="5" rx="3" fill="${t.shadowColor || t.accentHighlight}"/>
      <text x="150" y="50" fill="${t.textPrimary}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">App Service</text>
      <text x="150" y="62" fill="${t.textSecondary}" font-family="monospace" font-size="6" text-anchor="middle">Container</text>

      <!-- Data Layer -->
      <rect x="205" y="28" width="80" height="50" rx="6" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <rect x="205" y="28" width="80" height="5" rx="3" fill="${t.accentPrimary}"/>
      <text x="245" y="50" fill="${t.textPrimary}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">Database</text>
      <text x="245" y="62" fill="${t.textSecondary}" font-family="monospace" font-size="6" text-anchor="middle">PostgreSQL</text>

      <!-- Arrows -->
      <line x1="95" y1="53" x2="110" y2="53" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="2"/>
      <line x1="190" y1="53" x2="205" y2="53" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="2"/>

      <!-- Cache + Monitor Row -->
      <rect x="110" y="95" width="80" height="40" rx="6" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <text x="150" y="114" fill="${t.textPrimary}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">Redis Cache</text>
      <text x="150" y="126" fill="${t.textSecondary}" font-family="monospace" font-size="6" text-anchor="middle">In-Memory</text>

      <rect x="205" y="95" width="80" height="40" rx="6" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
      <text x="245" y="114" fill="${t.textPrimary}" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">Telemetry</text>
      <text x="245" y="126" fill="${t.textSecondary}" font-family="monospace" font-size="6" text-anchor="middle">Prometheus</text>

      <!-- Vertical connectors -->
      <line x1="150" y1="78" x2="150" y2="95" stroke="${t.cardBorder}" stroke-width="1.5" stroke-dasharray="4,3"/>
      <line x1="245" y1="78" x2="245" y2="95" stroke="${t.cardBorder}" stroke-width="1.5" stroke-dasharray="4,3"/>

      <!-- Host boundary -->
      <rect x="8" y="22" width="${width - 16}" height="${height - 30}" rx="8" fill="none" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1" stroke-dasharray="6,4"/>
      <text x="${width - 12}" y="${height - 8}" fill="${t.textMuted || t.textSecondary}" font-family="monospace" font-size="6" text-anchor="end">Docker Host</text>
    </svg>`;
  };

  /**
   * Generate Process Execution Flow SVG preview
   */
  DeckMindVisual.generateProcessFlowSVG = function (themeId, steps, width = 300, height = 170) {
    const t = DeckMindVisual.getTheme(themeId);

    const defaultSteps = [
      { label: 'Ingest' },
      { label: 'Extract' },
      { label: 'Transform' },
      { label: 'Export' }
    ];
    const flowSteps = (steps && steps.length >= 3) ? steps : defaultSteps;
    const count = Math.min(flowSteps.length, 5);
    const boxW = 52;
    const boxH = 36;
    const gap = 14;
    const totalW = count * boxW + (count - 1) * gap;
    const startX = (width - totalW) / 2;
    const startY = (height - boxH) / 2 + 8;

    let stepsSvg = flowSteps.slice(0, count).map((st, idx) => {
      const x = startX + idx * (boxW + gap);
      const isEven = idx % 2 === 0;
      let svg = `
        <rect x="${x + 2}" y="${startY + 2}" width="${boxW}" height="${boxH}" rx="5" fill="${t.shadowColor || t.accentHighlight}"/>
        <rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="5" fill="${t.cardBg}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="1.5"/>
        <rect x="${x}" y="${startY}" width="${boxW}" height="4" rx="2" fill="${isEven ? t.accentPrimary : (t.shadowColor || t.accentHighlight)}"/>
        <text x="${x + boxW / 2}" y="${startY + 22}" fill="${t.textPrimary}" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">${escapeXml((st.label || st.title || '').slice(0, 10))}</text>
      `;
      if (idx < count - 1) {
        const arrowX1 = x + boxW + 2;
        const arrowX2 = arrowX1 + gap - 4;
        const arrowY = startY + boxH / 2;
        svg += `<line x1="${arrowX1}" y1="${arrowY}" x2="${arrowX2}" y2="${arrowY}" stroke="${t.shadowColor || t.accentHighlight}" stroke-width="2"/>
                <polygon points="${arrowX2},${arrowY} ${arrowX2 - 4},${arrowY - 3} ${arrowX2 - 4},${arrowY + 3}" fill="${t.shadowColor || t.accentHighlight}"/>`;
      }
      return svg;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="8" fill="${t.bg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="12" y="16" fill="${t.textMuted || t.textSecondary}" font-family="monospace" font-size="8" font-weight="bold">PROCESS EXECUTION FLOW</text>
      ${stepsSvg}
    </svg>`;
  };

  /**
   * Generate KPI Metric Radial Gauges SVG preview
   */
  DeckMindVisual.generateMetricGaugesSVG = function (themeId, metrics, width = 300, height = 170) {
    const t = DeckMindVisual.getTheme(themeId);

    const defaultMetrics = [
      { value: '99.9%', label: 'Uptime' },
      { value: '<50ms', label: 'Latency' },
      { value: '10x', label: 'Scale' }
    ];
    const displayMetrics = (metrics && metrics.length >= 2) ? metrics.slice(0, 3) : defaultMetrics;
    const count = displayMetrics.length;
    const gaugeR = 28;
    const gap = (width - 40) / count;

    let gaugesSvg = displayMetrics.map((m, idx) => {
      const cx = 20 + gap * idx + gap / 2;
      const cy = height / 2 + 4;
      const colors = [t.accentPrimary, t.shadowColor || t.accentHighlight, t.accentSecondary || t.accentPrimary];
      const strokeColor = colors[idx % colors.length];

      return `
        <circle cx="${cx}" cy="${cy}" r="${gaugeR}" fill="none" stroke="${t.cardBorder}" stroke-width="5"/>
        <circle cx="${cx}" cy="${cy}" r="${gaugeR}" fill="none" stroke="${strokeColor}" stroke-width="5"
          stroke-dasharray="${gaugeR * 2 * 3.14159 * 0.75} ${gaugeR * 2 * 3.14159 * 0.25}"
          stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
        <circle cx="${cx}" cy="${cy}" r="${gaugeR - 7}" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="0.5"/>
        <text x="${cx}" y="${cy + 1}" fill="${strokeColor}" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">${escapeXml((m.value || '').slice(0, 6))}</text>
        <text x="${cx}" y="${cy + gaugeR + 14}" fill="${t.textPrimary}" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">${escapeXml((m.label || '').slice(0, 12))}</text>
      `;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="8" fill="${t.bg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="12" y="16" fill="${t.textMuted || t.textSecondary}" font-family="monospace" font-size="8" font-weight="bold">KPI METRIC GAUGES</text>
      ${gaugesSvg}
    </svg>`;
  };

  // Export for browser and node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckMindVisual;
  } else {
    root.DeckMindVisual = DeckMindVisual;
  }
})(typeof self !== 'undefined' ? self : this);
