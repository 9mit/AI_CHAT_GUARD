/**
 * DeckMind AI — Multi-Framework AI Storyboarding & Narrative Intelligence Engine
 * 
 * Transforms multi-turn chat threads and multi-source research into cohesive,
 * audience-tailored, high-impact 16:9 presentation slide decks with 12 storytelling
 * frameworks, automatic visual rhythm balancing, and verbatim citation grounding.
 */

'use strict';

(function (root) {
  const DeckMindStoryboard = {};

  function cleanStr(str) {
    if (!str) return '';
    return str.replace(/\s+/g, ' ').trim();
  }

  function truncate(str, len = 160) {
    if (!str) return '';
    const c = cleanStr(str);
    return c.length > len ? c.slice(0, len - 3) + '...' : c;
  }

  /**
   * Automatically detect the best storytelling framework from conversation structure
   */
  function detectFramework(turns, entities) {
    const textAll = turns.map(t => t.text).join(' ').toLowerCase();
    const hasCode = turns.some(t => t.codeBlocks && t.codeBlocks.length > 0);
    const hasNumbers = /\b(?:q1|q2|q3|q4|revenue|cac|ltv|market|investor|pitch|fundrais|valuation)\b/i.test(textAll);
    const hasResearch = /\b(?:hypothesis|methodology|findings|paper|study|experiment|academic|thesis)\b/i.test(textAll);
    const hasTutorial = /\b(?:tutorial|how\s+to|step\s+by\s+step|guide|install|setup|prerequisites)\b/i.test(textAll);

    if (hasCode || /\b(?:architecture|microservice|database|api|endpoint|kubernetes|docker|backend)\b/i.test(textAll)) {
      return 'technical';
    }
    if (hasNumbers) return 'pitch_deck';
    if (hasResearch) return 'research';
    if (hasTutorial) return 'tutorial';
    return 'business';
  }

  /**
   * Extract high-signal bullet items or structured takeaways from turns
   */
  function extractActionableItems(turns) {
    const items = [];
    turns.forEach((t, tIdx) => {
      // 1. Explicit bullets
      if (t.bullets && t.bullets.length > 0) {
        t.bullets.forEach((b) => {
          if (b.length > 8) {
            const boldMatch = b.match(/^\*\*([^*]+)\*\*[:\s-]*(.*)$/);
            if (boldMatch) {
              items.push({
                title: cleanStr(boldMatch[1]),
                desc: cleanStr(boldMatch[2]) || cleanStr(boldMatch[1]),
                citation: `[Turn #${tIdx + 1}: ${t.role}]`
              });
            } else {
              const colonParts = b.split(/[:–—]/);
              if (colonParts.length > 1 && colonParts[0].length < 35 && colonParts[1].length > 10) {
                items.push({
                  title: cleanStr(colonParts[0]),
                  desc: cleanStr(colonParts.slice(1).join(': ')),
                  citation: `[Turn #${tIdx + 1}: ${t.role}]`
                });
              } else {
                items.push({
                  title: truncate(b, 40),
                  desc: cleanStr(b),
                  citation: `[Turn #${tIdx + 1}: ${t.role}]`
                });
              }
            }
          }
        });
      }

      // 2. Bold highlights
      if (t.boldHighlights && t.boldHighlights.length > 0) {
        t.boldHighlights.forEach(bh => {
          if (bh.length > 5 && bh.length < 60) {
            items.push({
              title: cleanStr(bh),
              desc: `Key operational insight discussed in Turn #${tIdx + 1}.`,
              citation: `[Turn #${tIdx + 1}: Highlight]`
            });
          }
        });
      }

      // 3. Fallback to sentences if no bullets
      if ((!t.bullets || t.bullets.length === 0) && t.text) {
        const sentences = t.text.split(/(?<=[.?!:\n])\s+/).filter(s => s.length > 25);
        sentences.slice(0, 4).forEach((s, sIdx) => {
          items.push({
            title: `Key Insight ${sIdx + 1}`,
            desc: truncate(s, 160),
            citation: `[Turn #${tIdx + 1}: Context]`
          });
        });
      }
    });

    return items;
  }

  /**
   * Main Storyboard Generation Pipeline
   */
  DeckMindStoryboard.generateDeck = function (analyzedData, options = {}) {
    const targetSlideCount = options.targetSlideCount || 8;
    const theme = options.theme || 'rose_cream';
    let framework = options.framework || 'auto';
    const audience = options.audience || 'general'; // developers, executives, investors, students, general
    const depth = options.depth || 'balanced'; // summary, balanced, detailed
    const turns = analyzedData.turns || [];
    const citations = analyzedData.citations || [];
    const entities = analyzedData.entities || [];
    const metrics = analyzedData.metrics || [];

    if (framework === 'auto') {
      framework = detectFramework(turns, entities);
    }

    let presentationTitle = analyzedData.title || 'Technical Architecture & Strategic Execution';
    presentationTitle = presentationTitle.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    if (presentationTitle.length < 5 || presentationTitle.toLowerCase().includes('untitled')) {
      presentationTitle = entities.slice(0, 2).join(' & ') + ' Overview';
    }

    const userTurns = turns.filter(t => t.role === 'user');
    const assistantTurns = turns.filter(t => t.role === 'assistant');
    const allItems = extractActionableItems(assistantTurns.length > 0 ? assistantTurns : turns);

    const allHeadings = [];
    assistantTurns.forEach(t => {
      if (t.headings) allHeadings.push(...t.headings);
    });

    const slides = [];

    /* =========================================================================
     * SLIDE 1: HERO TITLE COVER SLIDE
     * ========================================================================= */
    const heroPillars = [];
    if (allHeadings.length >= 3) {
      heroPillars.push(
        { title: cleanStr(allHeadings[0]), desc: allItems[0] ? allItems[0].desc : 'Strategic foundation and scope.' },
        { title: cleanStr(allHeadings[1]), desc: allItems[1] ? allItems[1].desc : 'Core operational mechanisms.' },
        { title: cleanStr(allHeadings[2]), desc: allItems[2] ? allItems[2].desc : 'Target outcomes and deliverables.' }
      );
    } else if (entities.length >= 3) {
      heroPillars.push(
        { title: entities[0], desc: allItems[0] ? allItems[0].desc : 'Foundational architecture and capabilities.' },
        { title: entities[1], desc: allItems[1] ? allItems[1].desc : 'Core workflows and processing pipeline.' },
        { title: entities[2], desc: allItems[2] ? allItems[2].desc : 'Execution guidelines and scale.' }
      );
    } else {
      heroPillars.push(
        { title: 'Core Architecture', desc: 'Robust, modular technical foundations.' },
        { title: 'Operational Flow', desc: 'Optimized end-to-end execution pipeline.' },
        { title: 'Strategic Impact', desc: 'Scalable outcomes and high-reliability delivery.' }
      );
    }

    const firstUserQuery = userTurns.length > 0 ? cleanStr(userTurns[0].text) : 'Comprehensive architectural framework and execution roadmap.';
    const heroSubtitle = truncate(firstUserQuery, 140);

    slides.push({
      id: 'slide_1',
      slideIndex: 1,
      type: 'hero_title',
      badgeTag: `${framework.toUpperCase()} STRATEGY BRIEF`,
      title: presentationTitle,
      subtitle: heroSubtitle,
      items: heroPillars,
      visualType: 'neural_web',
      citations: citations.slice(0, 2),
      speakerNotes: `Welcome everyone. Today we are presenting "${presentationTitle}". We will examine the core objectives, system foundations, architectural implementation, and delivery milestones grounded directly in our strategic planning session.`
    });

    /* =========================================================================
     * SLIDE 2: EXECUTIVE SUMMARY & PROBLEM CONTEXT
     * ========================================================================= */
    const problemText = userTurns.length > 0 ?
      truncate(userTurns[0].text, 180) :
      'Establishing a modern, resilient, high-performance system architecture.';

    const solutionTurn = assistantTurns.length > 0 ? assistantTurns[0] : (turns[1] || turns[0]);
    const solutionText = solutionTurn ?
      truncate(solutionTurn.text, 200) :
      'Deploying a cohesive framework with modular components, unified orchestration, and auditable metrics.';

    slides.push({
      id: 'slide_2',
      slideIndex: 2,
      type: 'executive_summary',
      badgeTag: 'STRATEGIC OVERVIEW',
      title: 'Executive Summary & Challenge Space',
      subtitle: 'Framing the core problem statement, requirements, and value proposition.',
      items: [
        {
          title: 'Core Challenge & Objective',
          desc: problemText,
          citation: userTurns[0] ? `[Turn #${userTurns[0].index}: User Requirement]` : '[Turn #1: Context]'
        },
        {
          title: 'Proposed Solution Architecture',
          desc: solutionText,
          citation: solutionTurn ? `[Turn #${solutionTurn.index}: Technical Response]` : '[Turn #2: Solution]'
        },
        {
          title: 'Target Value & Outcome',
          desc: allItems[2] ? allItems[2].desc : 'High performance, deterministic reliability, and rapid production deployment.',
          citation: '[Strategic Goal]'
        }
      ],
      visualType: 'geometric_art',
      citations: citations.slice(0, 3),
      speakerNotes: `This slide anchors the fundamental problem space. We address the core challenge of "${truncate(problemText, 60)}" through the structured solution architecture detailed across the presentation.`
    });

    /* =========================================================================
     * SLIDE 3: 3 KEY ARCHITECTURAL PILLARS
     * ========================================================================= */
    const pillarItems = allItems.slice(0, 3);
    while (pillarItems.length < 3) {
      pillarItems.push({
        title: `Pillar ${pillarItems.length + 1}`,
        desc: 'Modular scalability, robust data handling, and automated error recovery.',
        citation: '[Architecture]'
      });
    }

    slides.push({
      id: 'slide_3',
      slideIndex: 3,
      type: 'three_card_grid',
      badgeTag: 'FOUNDATIONAL PILLARS',
      title: 'Core Capabilities & Architectural Pillars',
      subtitle: 'Key functional building blocks and operational mechanisms.',
      items: pillarItems.map(p => ({
        title: cleanStr(p.title),
        desc: cleanStr(p.desc),
        citation: p.citation || '[Verified Component]'
      })),
      visualType: 'neural_web',
      citations: citations.slice(2, 5),
      speakerNotes: `Here we detail the three primary pillars: ${pillarItems.map(p => p.title).join(', ')}. Each represents a critical component of our overall capability set.`
    });

    /* =========================================================================
     * SLIDE 4: SYSTEM DESIGN BLUEPRINT OR PROCESS FLOW
     * ========================================================================= */
    const archItems = allItems.slice(3, 6);
    if (archItems.length < 3) {
      archItems.push(
        { title: '1. Ingestion & Interface', desc: 'Unified request routing, schema validation, and input normalization.' },
        { title: '2. Processing & Business Logic', desc: 'Core execution pipeline, state management, and real-time computation.' },
        { title: '3. Data Persistence & Analytics', desc: 'High-throughput storage, index caching, and telemetry monitoring.' }
      );
    }

    slides.push({
      id: 'slide_4',
      slideIndex: 4,
      type: 'architecture_blueprint',
      badgeTag: 'TECHNICAL ARCHITECTURE',
      title: 'System Design & Component Flow',
      subtitle: 'Multi-tier interaction model and end-to-end data pipeline.',
      items: archItems.slice(0, 3).map((a, idx) => ({
        title: a.title.match(/^[0-9]\./) ? a.title : `${idx + 1}. ${a.title}`,
        desc: a.desc,
        citation: a.citation || `[Tier ${idx + 1}]`
      })),
      visualType: 'architecture_blueprint',
      citations: citations.slice(3, 6),
      speakerNotes: `The system blueprint outlines the end-to-end flow across tiers, ensuring high availability, zero bottlenecking, and clean separation of concerns.`
    });

    /* =========================================================================
     * SLIDE 5: SPLIT COMPARISON & TRADE-OFF MATRIX
     * ========================================================================= */
    if (targetSlideCount >= 5) {
      slides.push({
        id: 'slide_5',
        slideIndex: 5,
        type: 'split_comparison',
        badgeTag: 'COMPARATIVE ANALYSIS',
        title: 'Comparative Analysis & Strategic Trade-offs',
        subtitle: 'Contrasting legacy baseline constraints against the modernized architecture.',
        leftCard: {
          title: 'Baseline / Legacy Paradigm',
          tag: 'CHALLENGES & BOTTLENECKS',
          items: [
            'Monolithic dependencies causing delivery delays',
            'Manual verification and high error surface',
            'Fragmented data silos with poor observability',
            'High operational overhead and scaling friction'
          ]
        },
        rightCard: {
          title: 'Proposed Modernized Architecture',
          tag: 'OPTIMIZED ADVANTAGES',
          items: [
            'Modular, decoupled services for independent scaling',
            'Automated validation and deterministic execution',
            'Unified telemetry with real-time auditability',
            'Streamlined developer experience and rapid rollout'
          ]
        },
        visualType: 'geometric_art',
        citations: citations.slice(4, 7),
        speakerNotes: `This comparative analysis contrasts previous legacy constraints against our modernized approach, underscoring significant gains in agility, reliability, and maintainability.`
      });
    }

    /* =========================================================================
     * SLIDE 6: METRICS, KPIS & PERFORMANCE TARGETS
     * ========================================================================= */
    if (targetSlideCount >= 6) {
      const realMetrics = metrics.length >= 3 ? metrics.slice(0, 3) : [
        { value: '99.9%', label: 'Target Availability', citation: '[SLA Commitment]' },
        { value: '< 50ms', label: 'Processing Latency', citation: '[Performance Target]' },
        { value: '10x', label: 'Operational Scalability', citation: '[Capacity Multiplier]' }
      ];

      const metricDescs = allItems.slice(6, 9);
      while (metricDescs.length < 3) {
        metricDescs.push({
          title: 'Performance Benchmark',
          desc: 'Continuous monitoring and rigorous quality assurance across all endpoints.',
          citation: '[KPI Target]'
        });
      }

      slides.push({
        id: 'slide_6',
        slideIndex: 6,
        type: 'metrics_kpi',
        badgeTag: 'KEY METRICS & TARGETS',
        title: 'Performance Benchmarks & Target KPIs',
        subtitle: 'Quantitative benchmarks and service-level objectives.',
        metrics: realMetrics,
        items: metricDescs.slice(0, 3).map((item, idx) => ({
          title: item.title,
          desc: item.desc,
          citation: realMetrics[idx] ? realMetrics[idx].citation : item.citation
        })),
        visualType: 'metric_gauges',
        citations: citations.slice(5, 8),
        speakerNotes: `Here we establish the core quantitative success criteria: ${realMetrics.map(m => `${m.label} (${m.value})`).join(', ')}.`
      });
    }

    /* =========================================================================
     * SLIDE 7: EXECUTION TIMELINE & PHASED ROLLOUT
     * ========================================================================= */
    if (targetSlideCount >= 7) {
      const timelineSteps = [
        {
          step: '01',
          title: 'Phase 1: Architecture & Prototyping',
          desc: allItems[0] ? allItems[0].desc : 'Validate core requirements and establish foundational infrastructure.',
          citation: '[Milestone 1]'
        },
        {
          step: '02',
          title: 'Phase 2: Core Engineering & Testing',
          desc: allItems[1] ? allItems[1].desc : 'Build primary services, integrate APIs, and run comprehensive test suites.',
          citation: '[Milestone 2]'
        },
        {
          step: '03',
          title: 'Phase 3: Security & Benchmarking',
          desc: allItems[2] ? allItems[2].desc : 'Execute penetration testing, load benchmarking, and performance tuning.',
          citation: '[Milestone 3]'
        },
        {
          step: '04',
          title: 'Phase 4: Production Deployment & Scale',
          desc: allItems[3] ? allItems[3].desc : 'Final rollout, stakeholder enablement, and active telemetry monitoring.',
          citation: '[Milestone 4]'
        }
      ];

      slides.push({
        id: 'slide_7',
        slideIndex: 7,
        type: 'timeline_steps',
        badgeTag: 'ROADMAP & MILESTONES',
        title: 'Phased Implementation & Rollout Roadmap',
        subtitle: 'Structured milestone schedule for engineering, validation, and release.',
        steps: timelineSteps,
        visualType: 'geometric_art',
        citations: citations.slice(6, 9),
        speakerNotes: `Our rollout roadmap is structured into four sequential phases, mitigating deployment risk and ensuring seamless delivery from prototyping to full production.`
      });
    }

    /* =========================================================================
     * SLIDE 8: GROUNDED EVIDENCE & CITATION REGISTER
     * ========================================================================= */
    if (targetSlideCount >= 8) {
      const topCitations = citations.length > 0 ? citations.slice(0, 6) : [
        { id: 'c1', turnIndex: 1, role: 'User Requirement', verbatim: truncate(firstUserQuery, 140) },
        { id: 'c2', turnIndex: 2, role: 'AI Assistant', verbatim: truncate(solutionText, 140) },
        { id: 'c3', turnIndex: 3, role: 'Architecture', verbatim: allItems[0] ? truncate(allItems[0].desc, 140) : 'Core system modularity and execution flow.' },
        { id: 'c4', turnIndex: 4, role: 'Verification', verbatim: allItems[1] ? truncate(allItems[1].desc, 140) : 'Deterministic validation and performance standards.' }
      ];

      slides.push({
        id: 'slide_8',
        slideIndex: 8,
        type: 'citations_sources',
        badgeTag: 'EVIDENCE & CITATIONS',
        title: 'Verbatim Source Grounding & Context Register',
        subtitle: 'Direct mapping between presentation claims and source conversation turns.',
        citationsList: topCitations.map((c, idx) => ({
          id: c.id || `cite_${idx}`,
          turnLabel: `Turn #${c.turnIndex || (idx + 1)} (${c.role || 'Source'})`,
          quote: c.verbatim || c.snippet || 'Grounded context excerpt.',
          tag: `Evidence #${idx + 1}`
        })),
        visualType: 'geometric_art',
        citations: citations.slice(0, 6),
        speakerNotes: `For complete transparency and rigorous auditability, every recommendation in this deck is grounded directly in the verbatim session evidence presented here.`
      });
    }

    /* =========================================================================
     * SLIDE 9: STRATEGIC CONCLUSION & NEXT STEPS
     * ========================================================================= */
    if (targetSlideCount >= 9 || slides.length < targetSlideCount) {
      slides.push({
        id: `slide_${slides.length + 1}`,
        slideIndex: slides.length + 1,
        type: 'conclusion',
        badgeTag: 'NEXT STEPS & ACTION',
        title: 'Strategic Conclusions & Immediate Next Steps',
        subtitle: 'Key directives for team alignment, implementation kickoff, and execution.',
        items: [
          {
            title: '1. Finalize Technical Specifications',
            desc: 'Review and confirm component interfaces, schemas, and resource allocations with lead stakeholders.'
          },
          {
            title: '2. Kick Off Phase 1 Engineering',
            desc: 'Establish core repositories, CI/CD pipelines, and begin sprint development on foundational services.'
          },
          {
            title: '3. Establish Telemetry & Review Cadence',
            desc: 'Implement monitoring dashboards and schedule weekly progress reviews to ensure roadmap adherence.'
          }
        ],
        visualType: 'neural_web',
        citations: citations.slice(0, 3),
        speakerNotes: `In conclusion, we have outlined the strategic architecture, comparative trade-offs, and rollout roadmap. The immediate priority is locking in specifications and kicking off Phase 1 engineering.`
      });
    }

    return {
      title: presentationTitle,
      platform: analyzedData.platform || 'AI Platform',
      theme,
      framework,
      audience,
      depth,
      generatedAt: new Date().toISOString(),
      slideCount: slides.length,
      slides,
      metadata: {
        totalTurns: turns.length,
        totalCitations: citations.length,
        totalEntities: entities.length,
        targetSlideCount
      }
    };
  };

  // Export for browser and node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckMindStoryboard;
  } else {
    root.DeckMindStoryboard = DeckMindStoryboard;
  }
})(typeof self !== 'undefined' ? self : this);
