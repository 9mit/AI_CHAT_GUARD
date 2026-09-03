/**
 * DeckMind AI — Executive Microsoft PowerPoint (PPTX) Generator
 * 
 * Generates genuine, luxury-grade 16:9 widescreen PowerPoint presentation files (.pptx)
 * with executive-level visual polish, embedded high-resolution PNG vector diagrams
 * (Docker VPS topology, CI/CD pipelines, Zero-Trust security),
 * crisp card containers, accent caps, grounded citations, and speaker notes using PptxGenJS.
 */

'use strict';

(function (root) {
  const DeckMindPPTX = {};

  // Resolve PptxGenJS instance
  function getPptxGen() {
    if (typeof PptxGenJS !== 'undefined') return PptxGenJS;
    if (typeof window !== 'undefined' && window.PptxGenJS) return window.PptxGenJS;
    if (typeof require !== 'undefined') {
      try {
        return require('pptxgenjs');
      } catch (e) {
        return require('./lib/pptxgen.bundle.js');
      }
    }
    throw new Error('PptxGenJS library not loaded.');
  }

  // Convert hex color #RRGGBB to RRGGBB for PptxGenJS
  function cleanHex(hex, fallback = 'FFFFFF') {
    if (!hex) return fallback;
    return hex.replace('#', '').trim();
  }

  /**
   * Safely adds a PNG image to a slide with error handling
   */
  function safeAddImage(slide, pngDataUrl, opts) {
    if (!pngDataUrl || typeof pngDataUrl !== 'string' || !pngDataUrl.startsWith('data:image/png')) {
      return false;
    }
    try {
      slide.addImage({
        data: pngDataUrl,
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        sizing: opts.sizing || { type: 'contain', w: opts.w, h: opts.h }
      });
      return true;
    } catch (e) {
      console.warn('[DeckMind PPTX] safeAddImage warning:', e);
      return false;
    }
  }

  /**
   * Builds PptxGenJS presentation object from DeckMind presentation deck JSON
   */
  DeckMindPPTX.createPresentation = async function (deckData) {
    const PptxConstructor = getPptxGen();
    const pptx = new PptxConstructor();

    // 1. Set 16:9 Widescreen Layout (13.333" x 7.5")
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = deckData.title || 'Executive Presentation';
    pptx.subject = 'AI Strategic Presentation';
    pptx.author = 'DeckMind AI (Executive Edition)';

    const themeId = deckData.theme || 'rose_cream';
    const Visual = (typeof root.DeckMindVisual !== 'undefined') ? root.DeckMindVisual : (typeof DeckMindVisual !== 'undefined' ? DeckMindVisual : null);
    
    // Curated high-fashion executive palette
    const theme = (Visual && Visual.getTheme) ? Visual.getTheme(themeId) : {
      bg: '#FAF7F2',
      cardBg: '#FFFFFF',
      cardBorder: '#EAE5DD',
      accentPrimary: '#FB7185',
      accentSecondary: '#FDA4AF',
      accentHighlight: '#18181B',
      textPrimary: '#111111',
      textSecondary: '#52525B'
    };

    const colors = {
      bgHex: cleanHex(theme.bg, 'FAF7F2'),
      cardBgHex: cleanHex(theme.cardBg, 'FFFFFF'),
      cardBorderHex: cleanHex(theme.cardBorder, 'EAE5DD'),
      primaryHex: cleanHex(theme.accentPrimary, 'FB7185'),
      secondaryHex: cleanHex(theme.accentSecondary, 'FDA4AF'),
      highlightHex: cleanHex(theme.accentHighlight, '18181B'),
      darkHex: '18181B',
      lightPinkHex: 'FFF1F2',
      pinkBorderHex: 'FECDD3',
      pinkDarkTextHex: 'BE185D',
      textPrimaryHex: cleanHex(theme.textPrimary, '111111'),
      textSecondaryHex: cleanHex(theme.textSecondary, '52525B'),
      textMutedHex: '71717A'
    };

    const slides = deckData.slides || [];

    for (let i = 0; i < slides.length; i++) {
      const sData = slides[i];
      const slide = pptx.addSlide();
      slide.background = { color: colors.bgHex };

      // Add Presenter Speaker Notes & Evidence Register
      if (sData.speakerNotes) {
        let fullNotes = sData.speakerNotes;
        if (sData.citations && sData.citations.length > 0) {
          fullNotes += '\n\n--- [GROUNDED CITATIONS & EVIDENCE] ---\n';
          sData.citations.forEach(c => {
            fullNotes += `• [Turn #${c.turnIndex || c.id}]: "${c.verbatim || c.snippet}"\n`;
          });
        }
        slide.addNotes(fullNotes);
      }

      // Render by Slide Type with Embedded Visual Diagrams
      switch (sData.type) {
        case 'hero_title':
          renderHeroSlide(slide, sData, colors, themeId, Visual);
          break;
        case 'architecture_blueprint':
          renderArchitectureSlide(slide, sData, colors, themeId, Visual);
          break;
        case 'split_comparison':
          renderSplitComparisonSlide(slide, sData, colors, themeId, Visual);
          break;
        case 'metrics_kpi':
          renderMetricsSlide(slide, sData, colors, themeId, Visual);
          break;
        case 'timeline_steps':
          renderTimelineSlide(slide, sData, colors, themeId, Visual);
          break;
        case 'citations_sources':
          renderCitationsSlide(slide, sData, colors);
          break;
        case 'three_card_grid':
        case 'executive_summary':
        case 'knowledge_graph':
        case 'conclusion':
        default:
          renderStandardCardSlide(slide, sData, colors, themeId, Visual);
          break;
      }

      // Add Clean Footer Tag
      slide.addText('DeckMind AI  •  Executive Strategy & Architecture  •  Confidential', {
        x: 0.8,
        y: 7.08,
        w: 11.7,
        h: 0.3,
        fontSize: 8.5,
        color: colors.textMutedHex,
        fontFace: 'Segoe UI'
      });
    }

    return pptx;
  };

  /* =========================================================================
   * SLIDE HEADER HELPER
   * ========================================================================= */
  function addSlideHeader(slide, sData, c) {
    // 1. Badge Pill
    if (sData.badgeTag) {
      slide.addShape('roundRect', {
        x: 0.8,
        y: 0.42,
        w: 2.8,
        h: 0.32,
        rectRadius: 0.16,
        fill: { color: c.lightPinkHex },
        line: { color: c.darkHex, width: 1.5 }
      });
      slide.addText(sData.badgeTag.toUpperCase(), {
        x: 0.8,
        y: 0.42,
        w: 2.8,
        h: 0.32,
        fontSize: 9,
        bold: true,
        color: c.pinkDarkTextHex,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    }

    // 2. Slide Title
    slide.addText(sData.title || '', {
      x: 0.8,
      y: 0.78,
      w: 11.7,
      h: 0.65,
      fontSize: 22,
      bold: true,
      color: c.textPrimaryHex,
      fontFace: 'Georgia'
    });

    // 3. Slide Subtitle
    if (sData.subtitle) {
      slide.addText(sData.subtitle, {
        x: 0.8,
        y: 1.44,
        w: 11.7,
        h: 0.42,
        fontSize: 12.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    }

    // 4. Subtle Divider Line
    slide.addShape('line', {
      x: 0.8,
      y: 1.92,
      w: 11.7,
      h: 0,
      line: { color: c.darkHex, width: 1.5 }
    });
  }

  /* =========================================================================
   * 1. HERO COVER SLIDE (Split Hero with Embedded Architecture Diagram)
   * ========================================================================= */
  function renderHeroSlide(slide, sData, c, themeId, Visual) {
    // Category Badge
    slide.addShape('roundRect', {
      x: 0.8,
      y: 0.9,
      w: 3.2,
      h: 0.36,
      rectRadius: 0.18,
      fill: { color: c.lightPinkHex },
      line: { color: c.darkHex, width: 1.5 }
    });
    slide.addText(sData.badgeTag || 'EXECUTIVE STRATEGY BRIEF', {
      x: 0.8,
      y: 0.9,
      w: 3.2,
      h: 0.36,
      fontSize: 10,
      bold: true,
      color: c.pinkDarkTextHex,
      align: 'center',
      fontFace: 'Segoe UI'
    });

    // Main Big Title (Left Column)
    slide.addText(sData.title || 'Technical Architecture & Strategy', {
      x: 0.8,
      y: 1.4,
      w: 5.6,
      h: 1.8,
      fontSize: 28,
      bold: true,
      color: c.textPrimaryHex,
      fontFace: 'Georgia'
    });

    // Subtitle Description
    slide.addText(sData.subtitle || 'Executive roadmap, architectural foundations, and operational execution plan.', {
      x: 0.8,
      y: 3.25,
      w: 5.6,
      h: 0.9,
      fontSize: 13,
      color: c.textSecondaryHex,
      fontFace: 'Segoe UI'
    });

    // 2 Quick Feature Pills on Left
    const items = sData.items || [];
    items.slice(0, 2).forEach((item, idx) => {
      const yPos = 4.3 + idx * 1.25;
      slide.addShape('roundRect', {
        x: 0.8,
        y: yPos,
        w: 5.6,
        h: 1.1,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });
      slide.addShape('roundRect', {
        x: 0.8,
        y: yPos,
        w: 0.08,
        h: 1.1,
        rectRadius: 0.04,
        fill: { color: idx === 0 ? c.primaryHex : c.darkHex }
      });
      slide.addText(item.title || `Deliverable Pillar ${idx + 1}`, {
        x: 1.05,
        y: yPos + 0.15,
        w: 5.2,
        h: 0.35,
        fontSize: 12.5,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Segoe UI'
      });
      slide.addText(item.desc || '', {
        x: 1.05,
        y: yPos + 0.5,
        w: 5.2,
        h: 0.5,
        fontSize: 10.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });

    // Embedded Visual PNG Diagram on Right Column (5.8" x 4.8")
    if (Visual && Visual.generateDiagramPng) {
      const pngData = Visual.generateDiagramPng('architecture', themeId, { title: sData.title, app: sData.title }, 1000, 562);
      safeAddImage(slide, pngData, { x: 6.7, y: 0.9, w: 5.8, h: 4.8 });
    }
  }

  /* =========================================================================
   * 2. ARCHITECTURE BLUEPRINT SLIDE (Full-Bleed Visual Diagram + Specs)
   * ========================================================================= */
  function renderArchitectureSlide(slide, sData, c, themeId, Visual) {
    addSlideHeader(slide, sData, c);

    // Left Column: 3 Structured Architecture Spec Cards (4.8" Width)
    const items = sData.items || [];
    const colW = 4.8;
    const yStart = 2.15;
    const cardH = 1.45;

    items.slice(0, 3).forEach((item, idx) => {
      const yPos = yStart + idx * (cardH + 0.15);

      slide.addShape('roundRect', {
        x: 0.8,
        y: yPos,
        w: colW,
        h: cardH,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addShape('roundRect', {
        x: 0.8,
        y: yPos,
        w: 0.08,
        h: cardH,
        rectRadius: 0.04,
        fill: { color: idx === 1 ? c.primaryHex : c.darkHex }
      });

      slide.addText(`0${idx + 1}  •  ${item.title || 'Architecture Component'}`, {
        x: 1.05,
        y: yPos + 0.15,
        w: colW - 0.4,
        h: 0.35,
        fontSize: 12.5,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Segoe UI'
      });

      slide.addText(item.desc || '', {
        x: 1.05,
        y: yPos + 0.52,
        w: colW - 0.4,
        h: 0.82,
        fontSize: 10.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });

    // Right Column: Embedded High-Resolution System Topology PNG Diagram (6.6" x 4.65")
    if (Visual && Visual.generateDiagramPng) {
      const tierItems = (sData.items || []).map(it => it.title);
      const pngData = Visual.generateDiagramPng('architecture', themeId, {
        title: sData.title,
        tier1: tierItems[0] || '1. Ingress & Routing Gateway',
        tier2: tierItems[1] || '2. Processing & Business Logic',
        tier3: tierItems[2] || '3. State Persistence & Data Store'
      }, 1000, 562);
      safeAddImage(slide, pngData, { x: 5.9, y: 2.15, w: 6.6, h: 4.65 });
    }
  }

  /* =========================================================================
   * 3. SPLIT COMPARISON SLIDE
   * ========================================================================= */
  function renderSplitComparisonSlide(slide, sData, c, themeId, Visual) {
    addSlideHeader(slide, sData, c);

    const halfW = 5.65;
    const yPos = 2.15;
    const cardH = 4.65;

    // Left Card (Baseline Constraints)
    const left = sData.leftCard || { title: 'Baseline Constraints & Bottlenecks', items: ['Manual execution overhead', 'Single point of failure risks', 'Unbounded resource limits'] };
    slide.addShape('roundRect', {
      x: 0.8,
      y: yPos,
      w: halfW,
      h: cardH,
      rectRadius: 0.1,
      fill: { color: c.cardBgHex },
      line: { color: c.darkHex, width: 1.5 }
    });

    slide.addShape('roundRect', {
      x: 0.8,
      y: yPos,
      w: halfW,
      h: 0.08,
      rectRadius: 0.04,
      fill: { color: c.textMutedHex }
    });

    slide.addText(left.title, {
      x: 1.15,
      y: yPos + 0.3,
      w: halfW - 0.7,
      h: 0.45,
      fontSize: 15,
      bold: true,
      color: c.textSecondaryHex,
      fontFace: 'Georgia'
    });

    (left.items || []).forEach((bullet, bIdx) => {
      slide.addText(`•   ${bullet}`, {
        x: 1.15,
        y: yPos + 0.85 + bIdx * 0.8,
        w: halfW - 0.7,
        h: 0.7,
        fontSize: 11.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });

    // Right Card (Modernized Architecture & Safeguards)
    const right = sData.rightCard || { title: 'Optimized SaaS Architecture', items: ['Containerized isolation with healthchecks', 'Automated CI/CD deployment hooks', 'Strict TLS 1.3 & UFW firewall enforcement'] };
    const rightX = 6.85;

    slide.addShape('roundRect', {
      x: rightX,
      y: yPos,
      w: halfW,
      h: cardH,
      rectRadius: 0.1,
      fill: { color: c.cardBgHex },
      line: { color: c.darkHex, width: 2 }
    });

    slide.addShape('roundRect', {
      x: rightX,
      y: yPos,
      w: halfW,
      h: 0.08,
      rectRadius: 0.04,
      fill: { color: c.primaryHex }
    });

    slide.addText(right.title, {
      x: rightX + 0.35,
      y: yPos + 0.3,
      w: halfW - 0.7,
      h: 0.45,
      fontSize: 15,
      bold: true,
      color: c.textPrimaryHex,
      fontFace: 'Georgia'
    });

    (right.items || []).forEach((bullet, bIdx) => {
      slide.addText(`✔   ${bullet}`, {
        x: rightX + 0.35,
        y: yPos + 0.85 + bIdx * 0.8,
        w: halfW - 0.7,
        h: 0.7,
        fontSize: 11.5,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Segoe UI'
      });
    });
  }

  /* =========================================================================
   * 4. METRICS & KPI SLIDE
   * ========================================================================= */
  function renderMetricsSlide(slide, sData, c, themeId, Visual) {
    addSlideHeader(slide, sData, c);

    const metrics = sData.metrics || [
      { value: '99.9%', label: 'Uptime & Service Availability' },
      { value: '< 25ms', label: 'API Processing Latency' },
      { value: '10x', label: 'Throughput Scaling Factor' }
    ];
    const colW = 3.65;
    const yPos = 2.15;

    // Top Metric Stat Cards
    metrics.slice(0, 3).forEach((m, idx) => {
      const xPos = 0.8 + idx * (colW + 0.38);

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: colW,
        h: 2.05,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: colW,
        h: 0.06,
        rectRadius: 0.03,
        fill: { color: idx === 0 ? c.primaryHex : (idx === 1 ? c.darkHex : c.pinkDarkTextHex) }
      });

      slide.addText(m.value || '10x', {
        x: xPos + 0.2,
        y: yPos + 0.2,
        w: colW - 0.4,
        h: 0.95,
        fontSize: 36,
        bold: true,
        color: idx === 0 ? c.primaryHex : (idx === 1 ? c.darkHex : c.pinkDarkTextHex),
        align: 'center',
        fontFace: 'monospace'
      });

      slide.addText(m.label || 'Performance Dimension', {
        x: xPos + 0.2,
        y: yPos + 1.25,
        w: colW - 0.4,
        h: 0.55,
        fontSize: 12,
        bold: true,
        color: c.textPrimaryHex,
        align: 'center',
        fontFace: 'Segoe UI'
      });
    });

    // Bottom Explanatory Insight Cards
    const items = sData.items || [];
    items.slice(0, 3).forEach((item, idx) => {
      const xPos = 0.8 + idx * (colW + 0.38);
      const bY = 4.55;

      slide.addShape('roundRect', {
        x: xPos,
        y: bY,
        w: colW,
        h: 2.25,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addText(item.title || `Target Dimension ${idx + 1}`, {
        x: xPos + 0.25,
        y: bY + 0.25,
        w: colW - 0.5,
        h: 0.45,
        fontSize: 13.5,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Segoe UI'
      });

      slide.addText(item.desc || '', {
        x: xPos + 0.25,
        y: bY + 0.75,
        w: colW - 0.5,
        h: 1.3,
        fontSize: 11.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });
  }

  /* =========================================================================
   * 5. TIMELINE / ROADMAP SLIDE (With Embedded Pipeline Diagram)
   * ========================================================================= */
  function renderTimelineSlide(slide, sData, c, themeId, Visual) {
    addSlideHeader(slide, sData, c);

    const steps = sData.steps || [];

    // Embedded Visual Pipeline PNG Diagram (11.7" x 4.65")
    if (Visual && Visual.generateDiagramPng) {
      const pngData = Visual.generateDiagramPng('pipeline', themeId, { title: sData.title, steps }, 1000, 562);
      if (safeAddImage(slide, pngData, { x: 0.8, y: 2.15, w: 11.7, h: 4.65 })) {
        return;
      }
    }

    // Fallback 4-Step Cards
    const stepW = 2.7;
    const yPos = 2.15;
    const cardH = 4.65;

    steps.slice(0, 4).forEach((st, idx) => {
      const xPos = 0.8 + idx * (stepW + 0.3);

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: stepW,
        h: cardH,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: stepW,
        h: 0.08,
        rectRadius: 0.04,
        fill: { color: idx % 2 === 0 ? c.primaryHex : c.darkHex }
      });

      slide.addShape('roundRect', {
        x: xPos + 0.2,
        y: yPos + 0.25,
        w: 0.85,
        h: 0.32,
        rectRadius: 0.16,
        fill: { color: c.lightPinkHex },
        line: { color: c.darkHex, width: 1 }
      });
      slide.addText(st.step || `0${idx + 1}`, {
        x: xPos + 0.2,
        y: yPos + 0.25,
        w: 0.85,
        h: 0.32,
        fontSize: 10.5,
        bold: true,
        color: c.pinkDarkTextHex,
        align: 'center',
        fontFace: 'monospace'
      });

      slide.addText(st.title || '', {
        x: xPos + 0.2,
        y: yPos + 0.75,
        w: stepW - 0.4,
        h: 0.7,
        fontSize: 13,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Georgia'
      });

      slide.addText(st.desc || '', {
        x: xPos + 0.2,
        y: yPos + 1.55,
        w: stepW - 0.4,
        h: 2.8,
        fontSize: 11,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });
  }

  /* =========================================================================
   * 6. CITATIONS & GROUNDED EVIDENCE SLIDE
   * ========================================================================= */
  function renderCitationsSlide(slide, sData, c) {
    addSlideHeader(slide, sData, c);

    const cList = sData.citationsList || [];
    const colW = 5.65;
    const cardH = 1.35;

    cList.slice(0, 6).forEach((item, idx) => {
      const colIdx = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      const xPos = 0.8 + colIdx * (colW + 0.4);
      const yPos = 2.15 + rowIdx * (cardH + 0.2);

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: colW,
        h: cardH,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addText(item.turnLabel || `Evidence #${idx + 1}`, {
        x: xPos + 0.25,
        y: yPos + 0.15,
        w: colW - 0.5,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: c.pinkDarkTextHex,
        fontFace: 'monospace'
      });

      slide.addText(`"${item.quote || ''}"`, {
        x: xPos + 0.25,
        y: yPos + 0.48,
        w: colW - 0.5,
        h: 0.72,
        fontSize: 10.5,
        italic: true,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });
  }

  /* =========================================================================
   * 7. STANDARD CARD SLIDE (3 Pillars with Tactile Styling)
   * ========================================================================= */
  function renderStandardCardSlide(slide, sData, c, themeId, Visual) {
    addSlideHeader(slide, sData, c);

    const items = sData.items || [];
    const colW = 3.65;
    const yPos = 2.15;
    const cardH = 4.65;

    items.slice(0, 3).forEach((item, idx) => {
      const xPos = 0.8 + idx * (colW + 0.38);

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: colW,
        h: cardH,
        rectRadius: 0.08,
        fill: { color: c.cardBgHex },
        line: { color: c.darkHex, width: 1.5 }
      });

      slide.addShape('roundRect', {
        x: xPos,
        y: yPos,
        w: colW,
        h: 0.08,
        rectRadius: 0.04,
        fill: { color: idx === 0 ? c.primaryHex : (idx === 1 ? c.darkHex : c.pinkDarkTextHex) }
      });

      // Number badge
      slide.addShape('roundRect', {
        x: xPos + 0.25,
        y: yPos + 0.25,
        w: 0.65,
        h: 0.3,
        rectRadius: 0.06,
        fill: { color: c.lightPinkHex },
        line: { color: c.darkHex, width: 1 }
      });
      slide.addText(`0${idx + 1}`, {
        x: xPos + 0.25,
        y: yPos + 0.25,
        w: 0.65,
        h: 0.3,
        fontSize: 10.5,
        bold: true,
        color: c.pinkDarkTextHex,
        align: 'center',
        fontFace: 'monospace'
      });

      slide.addText(item.title || '', {
        x: xPos + 0.25,
        y: yPos + 0.7,
        w: colW - 0.5,
        h: 0.65,
        fontSize: 14.5,
        bold: true,
        color: c.textPrimaryHex,
        fontFace: 'Georgia'
      });

      slide.addText(item.desc || '', {
        x: xPos + 0.25,
        y: yPos + 1.45,
        w: colW - 0.5,
        h: 2.8,
        fontSize: 11.5,
        color: c.textSecondaryHex,
        fontFace: 'Segoe UI'
      });
    });
  }

  /**
   * Generates and triggers download of .pptx file in browser
   */
  DeckMindPPTX.downloadPresentation = async function (deckData, filename = null) {
    const pptx = await DeckMindPPTX.createPresentation(deckData);
    const cleanTitle = (deckData.title || 'DeckMind_Presentation').replace(/[^a-zA-Z0-9_-]/g, '_');
    const outName = filename || `${cleanTitle}.pptx`;
    return await pptx.writeFile({ fileName: outName });
  };

  /**
   * Generates ArrayBuffer / Blob for programmatic manipulation or backend transfer
   */
  DeckMindPPTX.generateBlob = async function (deckData) {
    const pptx = await DeckMindPPTX.createPresentation(deckData);
    return await pptx.write({ outputType: 'blob' });
  };

  // Export for browser and node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckMindPPTX;
  } else {
    root.DeckMindPPTX = DeckMindPPTX;
  }
})(typeof self !== 'undefined' ? self : this);
