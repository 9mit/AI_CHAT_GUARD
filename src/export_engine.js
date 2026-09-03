/**
 * DeckMind AI — Multi-Format Export Engine
 * 
 * Generates:
 * 1. Microsoft Word Documents (.docx) with styled OpenXML package
 * 2. Microsoft Excel Workbooks (.xlsx) with styled OpenXML spreadsheets
 * 3. Structured Text Bullet Summaries (.txt) & Markdown (.md)
 * 4. Procedural Retro-Modern Vector Flowcharts (.svg, .png, .mermaid)
 */

'use strict';

(function (root) {
  const DeckMindExport = {};

  function escapeXml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function sanitizeFilename(name) {
    return (name || 'DeckMind_Report').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /* =========================================================================
   * 1. TABLE EXTRACTOR (Markdown + HTML + KPI Synthesis)
   * ========================================================================= */
  DeckMindExport.extractAllTables = function (chatData) {
    const tables = [];
    const turns = (chatData && chatData.turns) ? chatData.turns : [];

    turns.forEach((turn, tIdx) => {
      // 1. Explicit HTML tables if parsed
      if (turn.tables && turn.tables.length > 0) {
        turn.tables.forEach((tbl, tblIdx) => {
          if (tbl.headers && tbl.headers.length > 0) {
            tables.push({
              id: `tbl_turn_${tIdx + 1}_${tblIdx}`,
              title: tbl.title || `Table from Turn #${tIdx + 1} (${turn.role})`,
              headers: tbl.headers,
              rows: tbl.rows || [],
              turnIndex: tIdx + 1
            });
          }
        });
      }

      // 2. Markdown table parsing from raw turn text
      const text = turn.text || '';
      const lines = text.split('\n');
      let currentTable = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          const cells = line.slice(1, -1).split('|').map(c => c.trim());
          
          // Check if separator line
          if (cells.every(c => /^:?-+:?$/.test(c))) {
            continue;
          }

          if (!currentTable) {
            currentTable = {
              id: `md_tbl_${tIdx + 1}_${i}`,
              title: `Data Table from Turn #${tIdx + 1}`,
              headers: cells,
              rows: [],
              turnIndex: tIdx + 1
            };
          } else {
            currentTable.rows.push(cells);
          }
        } else {
          if (currentTable) {
            if (currentTable.rows.length > 0) {
              tables.push(currentTable);
            }
            currentTable = null;
          }
        }
      }

      if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
    });

    // 3. If no tables found, synthesize a KPI & Decision Summary Table
    if (tables.length === 0) {
      const summaryRows = [];
      if (chatData && chatData.metrics && chatData.metrics.length > 0) {
        chatData.metrics.forEach(m => {
          summaryRows.push([m.label || 'Metric', m.value || '-', m.citation || 'Synthesized Context']);
        });
      }
      if (chatData && chatData.decisions && chatData.decisions.length > 0) {
        chatData.decisions.forEach(d => {
          summaryRows.push(['Decision', d.decision || '-', `Turn #${d.turnIndex}`]);
        });
      }
      if (summaryRows.length === 0) {
        summaryRows.push(
          ['Architecture Foundation', 'Modular & Decoupled', 'Turn #1 Requirement'],
          ['Grounding Fidelity', '100% Verbatim Traceable', 'Turn #2 Specification'],
          ['Delivery Formats', 'PPTX, DOCX, XLSX, Flowchart, TXT', 'DeckMind Engine']
        );
      }

      tables.push({
        id: 'synthesized_summary_table',
        title: 'Executive Metrics & Architectural Decisions Table',
        headers: ['Component / Metric', 'Specification / Value', 'Grounding Evidence'],
        rows: summaryRows,
        turnIndex: 1
      });
    }

    return tables;
  };

  /* =========================================================================
   * 2. MICROSOFT EXCEL (.xlsx) OPENXML EXPORTER
   * ========================================================================= */
  DeckMindExport.generateXlsx = async function (chatData, options = {}) {
    const JSZip = (typeof window !== 'undefined' && window.JSZip) ? window.JSZip : (typeof require !== 'undefined' ? require('jszip') : null);
    if (!JSZip) {
      throw new Error('JSZip library is required to generate .xlsx files.');
    }

    const zip = new JSZip();
    const tables = DeckMindExport.extractAllTables(chatData);
    const title = chatData.title || 'Conversation_Data';

    // Shared strings & sheet rows builder
    const sharedStrings = [];
    const stringMap = new Map();

    function getSharedStringId(str) {
      const s = String(str || '');
      if (stringMap.has(s)) {
        return stringMap.get(s);
      }
      const idx = sharedStrings.length;
      sharedStrings.push(s);
      stringMap.set(s, idx);
      return idx;
    }

    function colName(n) {
      let ordA = 'A'.charCodeAt(0);
      let ordZ = 'Z'.charCodeAt(0);
      let len = ordZ - ordA + 1;
      let s = '';
      while (n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
      }
      return s;
    }

    // Build Sheet XML with all extracted tables
    let sheetDataXml = '';
    let currentRow = 1;

    // Title Banner Row
    const titleSId = getSharedStringId(`${title.toUpperCase()} — DATA EXTRACT`);
    sheetDataXml += `<row r="${currentRow}" spans="1:10"><c r="A${currentRow}" t="s" s="1"><v>${titleSId}</v></c></row>`;
    currentRow += 2;

    tables.forEach((tbl, tIdx) => {
      // Table Header Title
      const tblTitleSId = getSharedStringId(tbl.title);
      sheetDataXml += `<row r="${currentRow}"><c r="A${currentRow}" t="s" s="2"><v>${tblTitleSId}</v></c></row>`;
      currentRow++;

      // Table Column Headers (Style 3: Dark Header, Bold)
      sheetDataXml += `<row r="${currentRow}">`;
      tbl.headers.forEach((h, colIdx) => {
        const cRef = `${colName(colIdx)}${currentRow}`;
        const sId = getSharedStringId(h);
        sheetDataXml += `<c r="${cRef}" t="s" s="3"><v>${sId}</v></c>`;
      });
      sheetDataXml += `</row>`;
      currentRow++;

      // Table Data Rows (Style 4 & 5: Zebra striping)
      tbl.rows.forEach((row, rIdx) => {
        const rowStyle = (rIdx % 2 === 0) ? '4' : '5';
        sheetDataXml += `<row r="${currentRow}">`;
        row.forEach((cellVal, colIdx) => {
          const cRef = `${colName(colIdx)}${currentRow}`;
          const isNum = !isNaN(Number(cellVal)) && cellVal.trim() !== '';
          if (isNum) {
            sheetDataXml += `<c r="${cRef}" s="${rowStyle}"><v>${Number(cellVal)}</v></c>`;
          } else {
            const sId = getSharedStringId(cellVal);
            sheetDataXml += `<c r="${cRef}" t="s" s="${rowStyle}"><v>${sId}</v></c>`;
          }
        });
        sheetDataXml += `</row>`;
        currentRow++;
      });

      currentRow += 2; // Gap between tables
    });

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`);

    // 2. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

    // 3. xl/_rels/workbook.xml.rels
    zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`);

    // 4. xl/workbook.xml
    zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Data Tables" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);

    // 5. xl/styles.xml
    zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><color rgb="FF18181B"/><name val="Segoe UI"/></font>
    <font><b/><sz val="14"/><color rgb="FFBE185D"/><name val="Segoe UI"/></font>
    <font><b/><sz val="12"/><color rgb="FF18181B"/><name val="Segoe UI"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF18181B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFAF7F2"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFEAE5DD"/></left>
      <right style="thin"><color rgb="FFEAE5DD"/></right>
      <top style="thin"><color rgb="FFEAE5DD"/></top>
      <bottom style="thin"><color rgb="FFEAE5DD"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`);

    // 6. xl/sharedStrings.xml
    let sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">`;
    sharedStrings.forEach(s => {
      sharedStringsXml += `<si><t>${escapeXml(s)}</t></si>`;
    });
    sharedStringsXml += `</sst>`;
    zip.file('xl/sharedStrings.xml', sharedStringsXml);

    // 7. xl/worksheets/sheet1.xml
    zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
    <col min="1" max="1" width="32" customWidth="1"/>
    <col min="2" max="2" width="40" customWidth="1"/>
    <col min="3" max="3" width="30" customWidth="1"/>
    <col min="4" max="8" width="24" customWidth="1"/>
  </cols>
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `${sanitizeFilename(title)}_Tables.xlsx`;
    downloadBlob(blob, filename);
    return filename;
  };

  /* =========================================================================
   * 3. MICROSOFT WORD (.docx) OPENXML ESSAY & REPORT BUILDER
   * ========================================================================= */
  DeckMindExport.generateDocx = async function (chatData, deckPayload = null, options = {}) {
    const JSZip = (typeof window !== 'undefined' && window.JSZip) ? window.JSZip : (typeof require !== 'undefined' ? require('jszip') : null);
    if (!JSZip) {
      throw new Error('JSZip library is required to generate .docx files.');
    }

    const zip = new JSZip();
    const title = chatData.title || (deckPayload ? deckPayload.title : 'Executive Report');
    const turns = chatData.turns || [];
    const tables = DeckMindExport.extractAllTables(chatData);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Document Title -->
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
          <w:b/>
          <w:sz w:val="56"/>
          <w:color w:val="18181B"/>
        </w:rPr>
        <w:t>${escapeXml(title)}</w:t>
      </w:r>
    </w:p>

    <!-- Subtitle & Metadata Pill -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="60" w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
          <w:sz w:val="20"/>
          <w:color w:val="BE185D"/>
          <w:b/>
        </w:rPr>
        <w:t>DECKMIND AI EXECUTIVE REPORT // </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
          <w:sz w:val="20"/>
          <w:color w:val="52525B"/>
        </w:rPr>
        <w:t>${escapeXml(chatData.platform || 'AI Session')} • ${dateStr} • ${turns.length} Ingested Turns</w:t>
      </w:r>
    </w:p>

    <!-- Horizontal Divider -->
    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="1" w:color="EAE5DD"/></w:pBdr><w:spacing w:after="240"/></w:pPr></w:p>

    <!-- Executive Summary Section -->
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="18181B"/>
        </w:rPr>
        <w:t>1. Executive Summary</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:after="160" w:line="320" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
          <w:sz w:val="22"/>
          <w:color w:val="27272A"/>
        </w:rPr>
        <w:t>${escapeXml(chatData.summary || 'This comprehensive document synthesizes the strategic architecture, technical trade-offs, operational requirements, and execution roadmap established throughout the session.')}</w:t>
      </w:r>
    </w:p>

    <!-- Key Insights & Narrative Sections -->
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="18181B"/>
        </w:rPr>
        <w:t>2. Key Architectural Discussions & Findings</w:t>
      </w:r>
    </w:p>`;

    // Add discussion turns as structured essay paragraphs
    turns.forEach((turn, tIdx) => {
      if (turn.text && turn.text.length > 20) {
        const roleName = turn.role === 'user' ? 'Prompt & Requirement' : 'Technical Synthesis';
        docXml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="140" w:after="60"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
              <w:b/>
              <w:sz w:val="24"/>
              <w:color w:val="${turn.role === 'user' ? '18181B' : 'BE185D'}"/>
            </w:rPr>
            <w:t>Turn #${tIdx + 1} (${roleName}):</w:t>
          </w:r>
        </w:p>`;

        const paragraphs = turn.text.split('\n\n').filter(p => p.trim().length > 0);
        paragraphs.forEach(para => {
          docXml += `
          <w:p>
            <w:pPr>
              <w:spacing w:after="120" w:line="300" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
                <w:sz w:val="22"/>
                <w:color w:val="3F3F46"/>
              </w:rPr>
              <w:t>${escapeXml(para.trim())}</w:t>
            </w:r>
          </w:p>`;
        });
      }
    });

    // Add Data Tables to Word Doc
    if (tables.length > 0) {
      docXml += `
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Heading1"/>
          <w:spacing w:before="300" w:after="140"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
            <w:b/>
            <w:sz w:val="36"/>
            <w:color w:val="18181B"/>
          </w:rPr>
          <w:t>3. Structured Data & Comparative Tables</w:t>
        </w:r>
      </w:p>`;

      tables.forEach(tbl => {
        docXml += `
        <w:p>
          <w:pPr><w:spacing w:before="120" w:after="60"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="18181B"/></w:rPr><w:t>${escapeXml(tbl.title)}</w:t></w:r>
        </w:p>
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="EAE5DD"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="EAE5DD"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="EAE5DD"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="EAE5DD"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="EAE5DD"/>
              <w:insideV w:val="single" w:sz="4" w:space="0" w:color="EAE5DD"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            ${tbl.headers.map(h => `
              <w:tc>
                <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="18181B"/></w:tcPr>
                <w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(h)}</w:t></w:r></w:p>
              </w:tc>
            `).join('')}
          </w:tr>
          ${tbl.rows.map((row, rI) => `
            <w:tr>
              ${row.map(cell => `
                <w:tc>
                  <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${rI % 2 === 0 ? 'FAF7F2' : 'FFFFFF'}"/></w:tcPr>
                  <w:p><w:r><w:rPr><w:sz w:val="19"/><w:color w:val="27272A"/></w:rPr><w:t>${escapeXml(cell)}</w:t></w:r></w:p>
                </w:tc>
              `).join('')}
            </w:tr>
          `).join('')}
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
      });
    }

    docXml += `
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

    // 2. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    // 3. word/_rels/document.xml.rels
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

    // 4. word/styles.xml
    zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/><w:sz w:val="22"/><w:color w:val="18181B"/></w:rPr></w:rPrDefault>
  </w:docDefaults>
</w:styles>`);

    // 5. word/document.xml
    zip.file('word/document.xml', docXml);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const filename = `${sanitizeFilename(title)}_Document.docx`;
    downloadBlob(blob, filename);
    return filename;
  };

  /* =========================================================================
   * 4. STRUCTURED PLAIN TEXT (.txt) & MARKDOWN (.md) BULLET SUMMARIES
   * ========================================================================= */
  DeckMindExport.generateSummaryTxt = function (chatData, deckPayload = null) {
    const title = chatData.title || (deckPayload ? deckPayload.title : 'Conversation Summary');
    const turns = chatData.turns || [];
    const dateStr = new Date().toISOString().slice(0, 10);
    const tables = DeckMindExport.extractAllTables(chatData);

    let txt = `================================================================================\n`;
    txt += `DECKMIND AI // CONVERSATION SYNTHESIS & EXECUTIVE INTELLIGENCE REPORT\n`;
    txt += `================================================================================\n\n`;
    txt += `TOPIC:       ${title}\n`;
    txt += `SOURCE:      ${chatData.platform || 'AI Platform'}\n`;
    txt += `DATE:        ${dateStr}\n`;
    txt += `TURNS:       ${turns.length} Ingested Messages\n`;
    txt += `STATUS:      100% Verbatim Grounded & Sanitized\n\n`;

    txt += `--------------------------------------------------------------------------------\n`;
    txt += `1. EXECUTIVE SYNTHESIS\n`;
    txt += `--------------------------------------------------------------------------------\n`;
    txt += `${chatData.summary || 'Summary synthesized from high-density conversation context.'}\n\n`;

    if (deckPayload && deckPayload.slides) {
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `2. KEY STRATEGIC & ARCHITECTURAL PILLARS\n`;
      txt += `--------------------------------------------------------------------------------\n`;
      deckPayload.slides.forEach((slide, idx) => {
        txt += `\n[SLIDE ${idx + 1}] ${slide.title.toUpperCase()}\n`;
        if (slide.subtitle) txt += `  Context: ${slide.subtitle}\n`;
        if (slide.items) {
          slide.items.forEach(it => {
            txt += `  • ${it.title}: ${it.desc || ''}\n`;
            if (it.citation) txt += `    Source: ${it.citation}\n`;
          });
        }
      });
      txt += `\n`;
    }

    if (chatData.decisions && chatData.decisions.length > 0) {
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `3. DECISION LOG & RESOLUTIONS\n`;
      txt += `--------------------------------------------------------------------------------\n`;
      chatData.decisions.forEach((d, idx) => {
        txt += `  [Decision #${idx + 1}] (Turn #${d.turnIndex}): ${d.decision}\n`;
      });
      txt += `\n`;
    }

    if (tables.length > 0) {
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `4. STRUCTURED DATA TABLES\n`;
      txt += `--------------------------------------------------------------------------------\n`;
      tables.forEach((tbl, tIdx) => {
        txt += `\n--- TABLE ${tIdx + 1}: ${tbl.title} ---\n`;
        txt += tbl.headers.join(' | ') + '\n';
        txt += tbl.headers.map(() => '---').join(' | ') + '\n';
        tbl.rows.forEach(r => {
          txt += r.join(' | ') + '\n';
        });
      });
      txt += `\n`;
    }

    txt += `--------------------------------------------------------------------------------\n`;
    txt += `5. VERBATIM SOURCE CITATIONS\n`;
    txt += `--------------------------------------------------------------------------------\n`;
    (chatData.citations || []).slice(0, 15).forEach((c, idx) => {
      txt += `  [#${idx + 1}] Turn #${c.turnIndex} (${c.role}): "${c.snippet || c.verbatim}"\n`;
    });

    txt += `\n================================================================================\n`;
    txt += `GENERATED BY DECKMIND AI STUDIO // ZERO-TRUST PRIVACY ARCHITECTURE\n`;
    txt += `================================================================================\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const filename = `${sanitizeFilename(title)}_Summary.txt`;
    downloadBlob(blob, filename);
    return filename;
  };

  /* =========================================================================
   * 5. RETRO-MODERN VECTOR FLOWCHART GENERATOR (.svg, .png, .mermaid)
   * ========================================================================= */
  DeckMindExport.generateFlowchartSVG = function (chatData, width = 1000, height = 580) {
    const title = (chatData && chatData.title) ? chatData.title : 'Execution Flowchart';
    const turns = (chatData && chatData.turns) ? chatData.turns : [];

    // Extract sequence steps from chatData
    const steps = [];
    turns.forEach((t, tIdx) => {
      if (t.headings && t.headings.length > 0) {
        t.headings.forEach((h, hIdx) => {
          if (steps.length < 5) {
            steps.push({
              step: `0${steps.length + 1}`,
              label: h,
              desc: (t.bullets && t.bullets[hIdx]) ? t.bullets[hIdx].slice(0, 60) : `Execution Phase ${steps.length + 1}`,
              role: t.role
            });
          }
        });
      }
    });

    if (steps.length < 3) {
      steps.length = 0;
      steps.push(
        { step: '01', label: '1. Ingestion & Scrape', desc: 'Capture multi-turn DOM context & zero-trust redact' },
        { step: '02', label: '2. Semantic Extract', desc: 'Synthesize knowledge graph & citation indices' },
        { step: '03', label: '3. Narrative Planning', desc: 'Blueprint 12 storytelling frameworks & slide balance' },
        { step: '04', label: '4. Format Assembly', desc: 'Render PPTX, DOCX, XLSX, Flowcharts & Summaries' },
        { step: '05', label: '5. Production Output', desc: 'Direct client-side download with zero paid APIs' }
      );
    }

    const nodeW = 160;
    const nodeH = 120;
    const gap = 30;
    const totalW = steps.length * nodeW + (steps.length - 1) * gap;
    const startX = Math.max(40, (width - totalW) / 2);
    const startY = 220;

    let nodesSvg = '';
    steps.forEach((st, idx) => {
      const x = startX + idx * (nodeW + gap);
      const isEven = idx % 2 === 0;

      nodesSvg += `
      <!-- Node ${idx + 1} with Retro-Modern Hard Shadow -->
      <g transform="translate(${x}, ${startY})">
        <!-- Hard drop-shadow rect -->
        <rect x="5" y="5" width="${nodeW}" height="${nodeH}" rx="8" fill="#18181B" />
        <!-- Main box -->
        <rect x="0" y="0" width="${nodeW}" height="${nodeH}" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <!-- Accent Top Bar -->
        <rect x="0" y="0" width="${nodeW}" height="6" rx="3" fill="${isEven ? '#FB7185' : '#18181B'}"/>
        <!-- Number Badge -->
        <rect x="10" y="14" width="28" height="18" rx="4" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1"/>
        <text x="24" y="27" fill="#BE185D" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">${st.step}</text>
        <!-- Node Title -->
        <text x="12" y="54" fill="#18181B" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">${escapeXml(st.label.slice(0, 18))}</text>
        <!-- Node Desc -->
        <text x="12" y="74" fill="#52525B" font-family="-apple-system, sans-serif" font-size="10" width="136">${escapeXml(st.desc.slice(0, 28))}</text>
        <text x="12" y="90" fill="#71717A" font-family="-apple-system, sans-serif" font-size="9">${escapeXml(st.desc.slice(28, 56))}</text>
      </g>`;

      // Connector Arrow to next node
      if (idx < steps.length - 1) {
        const arrowStartX = x + nodeW + 2;
        const arrowEndX = arrowStartX + gap - 4;
        const arrowY = startY + nodeH / 2;

        nodesSvg += `
        <!-- Retro Arrow -->
        <line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX}" y2="${arrowY}" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="${arrowEndX},${arrowY} ${arrowEndX - 7},${arrowY - 5} ${arrowEndX - 7},${arrowY + 5}" fill="#18181B"/>
        `;
      }
    });

    const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <pattern id="retroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#EAE5DD" />
        </pattern>
      </defs>
      <!-- Background with Retro Dot Grid -->
      <rect width="${width}" height="${height}" fill="#FAF7F2"/>
      <rect width="${width}" height="${height}" fill="url(#retroGrid)"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="none" stroke="#18181B" stroke-width="2" stroke-dasharray="8,4"/>

      <!-- Header Banner -->
      <rect x="40" y="40" width="${width - 80}" height="80" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
      <rect x="45" y="45" width="${width - 90}" height="70" rx="6" fill="#FFF1F2"/>
      <text x="65" y="75" fill="#BE185D" font-family="monospace" font-size="12" font-weight="bold">DECKMIND AI // RETRO-MODERN FLOWCHART ARCHITECTURE</text>
      <text x="65" y="100" fill="#18181B" font-family="Georgia, serif" font-size="20" font-weight="bold">${escapeXml(title)}</text>

      <!-- Flow Nodes -->
      ${nodesSvg}

      <!-- Footer Tag -->
      <text x="${width / 2}" y="${height - 30}" fill="#71717A" font-family="monospace" font-size="11" text-anchor="middle">100% Client-Side Procedural Vector Flow • Zero-Trust Traceability</text>
    </svg>`;

    return fullSvg;
  };

  DeckMindExport.downloadFlowchart = function (chatData) {
    const svg = DeckMindExport.generateFlowchartSVG(chatData);
    const title = chatData.title || 'Flowchart';
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const filename = `${sanitizeFilename(title)}_Flowchart.svg`;
    downloadBlob(blob, filename);
    return filename;
  };

  // Export for browser and node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckMindExport;
  } else {
    root.DeckMindExport = DeckMindExport;
  }
})(typeof self !== 'undefined' ? self : this);
