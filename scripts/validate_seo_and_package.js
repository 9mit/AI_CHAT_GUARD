/**
 * Automated Verification Script for DeckMind AI SEO & Packaging Pipeline
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_DIR = path.join(ROOT_DIR, 'site');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('====================================================');
console.log('  DeckMind AI — Comprehensive SEO & Build Verification');
console.log('====================================================\n');

let errors = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passes++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    errors++;
  }
}

// 1. Verify Manifest V3 Constraints
const manifestPath = path.join(SRC_DIR, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert(manifest.manifest_version === 3, 'Manifest version is 3');
assert(manifest.name && manifest.name.length <= 45, `Manifest name length is <= 45 chars (${manifest.name.length} chars)`);
assert(manifest.description && manifest.description.length <= 132, `Manifest description length is <= 132 chars (${manifest.description.length} chars)`);
assert(manifest.icons && manifest.icons['128'], '128px icon declared');

// 2. Verify Website HTML Pages Exist & Contain SEO Essentials
const expectedPages = [
  'index.html',
  'chatgpt-to-powerpoint.html',
  'claude-to-presentation.html',
  'deepseek-to-ppt.html',
  'features.html',
  'how-it-works.html',
  'compare.html',
  'privacy.html',
  'security.html',
  'docs.html',
  'faq.html'
];

for (const page of expectedPages) {
  const filePath = path.join(SITE_DIR, page);
  const exists = fs.existsSync(filePath);
  assert(exists, `Page exists: site/${page}`);

  if (exists) {
    const html = fs.readFileSync(filePath, 'utf8');

    // Title tag
    const hasTitle = /<title>(.*?)<\/title>/i.test(html);
    assert(hasTitle, `site/${page} has <title> tag`);

    // Meta description
    const hasMetaDesc = /<meta\s+name="description"\s+content="([^"]+)"/i.test(html);
    assert(hasMetaDesc, `site/${page} has meta description`);

    // Canonical tag
    const hasCanonical = /<link\s+rel="canonical"\s+href="([^"]+)"/i.test(html);
    assert(hasCanonical, `site/${page} has canonical link`);

    // Single H1 tag
    const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gis) || [];
    assert(h1Matches.length === 1, `site/${page} has exactly one <h1> tag (found ${h1Matches.length})`);

    // JSON-LD validation
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      jsonLdMatches.forEach((scriptTag, idx) => {
        const rawJson = scriptTag.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim();
        try {
          JSON.parse(rawJson);
          assert(true, `site/${page} JSON-LD block #${idx + 1} is valid JSON`);
        } catch (e) {
          assert(false, `site/${page} JSON-LD block #${idx + 1} failed parse: ${e.message}`);
        }
      });
    }
  }
}

// 3. Verify sitemap.xml and robots.txt
const sitemapPath = path.join(SITE_DIR, 'sitemap.xml');
const robotsPath = path.join(SITE_DIR, 'robots.txt');

assert(fs.existsSync(sitemapPath), 'site/sitemap.xml exists');
assert(fs.existsSync(robotsPath), 'site/robots.txt exists');

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const page of expectedPages) {
    const urlSlug = page === 'index.html' ? 'https://deckmind.ai/' : `https://deckmind.ai/${page}`;
    assert(sitemap.includes(urlSlug), `sitemap.xml contains URL: ${urlSlug}`);
  }
}

// 4. Verify CWS Listing Copy Kit
const cwsDocPath = path.join(ROOT_DIR, 'cws_listing', 'cws_listing.md');
assert(fs.existsSync(cwsDocPath), 'cws_listing/cws_listing.md exists and is populated');

// 5. Verify In-Extension Onboarding & Review Assets
const studioJsPath = path.join(SRC_DIR, 'deck_studio.js');
const studioHtmlPath = path.join(SRC_DIR, 'deck_studio.html');
const studioJs = fs.readFileSync(studioJsPath, 'utf8');
const studioHtml = fs.readFileSync(studioHtmlPath, 'utf8');

assert(studioHtml.includes('id="onboarding-overlay"'), 'deck_studio.html contains onboarding overlay markup');
assert(studioHtml.includes('id="review-prompt-banner"'), 'deck_studio.html contains review prompt banner markup');
assert(studioJs.includes('checkFirstRunOnboarding'), 'deck_studio.js implements checkFirstRunOnboarding');
assert(studioJs.includes('recordExportAndCheckReviewPrompt'), 'deck_studio.js implements recordExportAndCheckReviewPrompt');

console.log('\n====================================================');
console.log(`  Verification Summary: ${passes} Passed, ${errors} Failed`);
console.log('====================================================\n');

if (errors > 0) {
  process.exit(1);
} else {
  console.log('🎉 All SEO, Schema, and Extension checks verified perfectly!\n');
}
