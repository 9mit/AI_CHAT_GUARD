/**
 * DeckMind AI — Production Chrome Web Store ZIP Packaging & Verification Script
 * 
 * Generates an upload-ready ZIP archive with standard root structure, forward-slash paths,
 * zero development artifacts, and preflight verification for Chrome Developer Dashboard.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ROOT_DIR = path.join(__dirname);
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const OUTPUT_ZIP_UPLOAD = path.join(DIST_DIR, 'deckmind-ai-chrome-store-upload.zip');

async function buildChromeStorePackage() {
  console.log('====================================================');
  console.log('  DeckMind AI — Chrome Web Store Packaging Pipeline ');
  console.log('====================================================\n');

  // 1. Verify src directory and manifest.json
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Source directory not found at: ${SRC_DIR}`);
  }

  const manifestPath = path.join(SRC_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in ${SRC_DIR}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.description && manifest.description.length > 132) {
    throw new Error(`CRITICAL: manifest.description is ${manifest.description.length} chars (Max allowed is 132)!`);
  }
  if (manifest.name && manifest.name.length > 45) {
    console.warn(`  ⚠ Notice: manifest.name is ${manifest.name.length} chars (Recommended <= 45 to prevent CWS search card truncation).`);
  } else {
    console.log(`  ✔ Title length optimal for CWS card search grids (${manifest.name.length}/45 chars)`);
  }
  console.log(`[1/4] Loaded Manifest V3: "${manifest.name}" (v${manifest.version}) [Description: ${manifest.description.length}/132 chars]`);

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // 2. Initialize JSZip and add files recursively
  const zip = new JSZip();
  let fileCount = 0;
  let totalBytes = 0;

  function addDirectoryToZip(dirPath, zipFolder) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      // Ignore hidden/system files
      if (item.startsWith('.') || item === 'Thumbs.db') {
        continue;
      }

      if (stat.isDirectory()) {
        const subFolder = zipFolder ? zipFolder.folder(item) : zip.folder(item);
        addDirectoryToZip(fullPath, subFolder);
      } else if (stat.isFile()) {
        const content = fs.readFileSync(fullPath);
        const relPath = path.relative(SRC_DIR, fullPath).replace(/\\/g, '/');

        if (zipFolder) {
          zipFolder.file(item, content);
        } else {
          zip.file(item, content);
        }

        fileCount++;
        totalBytes += stat.size;
        console.log(`  + [ADD] ${relPath.padEnd(30)} (${(stat.size / 1024).toFixed(1)} KB)`);
      }
    }
  }

  console.log('\n[2/4] Packaging extension assets from src/ into ZIP root:');
  addDirectoryToZip(SRC_DIR, null);

  // 3. Generate ZIP binary buffer
  console.log('\n[3/4] Compressing ZIP archive (DEFLATE level 9)...');
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(OUTPUT_ZIP_UPLOAD, zipBuffer);

  const zipKb = (zipBuffer.length / 1024).toFixed(1);
  const rawKb = (totalBytes / 1024).toFixed(1);

  console.log(`  ✔ Generated: ${OUTPUT_ZIP_UPLOAD}`);
  console.log(`  ✔ Uncompressed: ${rawKb} KB (${fileCount} files) -> Compressed: ${zipKb} KB`);

  // 4. Preflight Read-Back Verification
  console.log('\n[4/4] Verifying Chrome Web Store Upload Compliance:');
  const verifyZip = await JSZip.loadAsync(zipBuffer);

  // Verification 1: manifest.json at root
  const manifestInZip = verifyZip.file('manifest.json');
  if (!manifestInZip) {
    throw new Error('CRITICAL: manifest.json is NOT at the root of the ZIP archive!');
  }
  console.log('  ✔ manifest.json confirmed at root of archive');

  // Verification 2: Check required icons
  const requiredIcons = ['icons/icon16.png', 'icons/icon32.png', 'icons/icon48.png', 'icons/icon128.png'];
  for (const icon of requiredIcons) {
    if (!verifyZip.file(icon)) {
      throw new Error(`CRITICAL: Icon ${icon} is missing from archive!`);
    }
  }
  console.log('  ✔ All extension icons present (16, 32, 48, 128)');

  // Verification 3: Check critical scripts
  const criticalFiles = ['background.js', 'content.js', 'chat_parsers.js', 'deck_studio.html', 'deck_studio.js', 'pptx_generator.js', 'popup.html', 'lib/jszip.min.js'];
  for (const f of criticalFiles) {
    if (!verifyZip.file(f)) {
      throw new Error(`CRITICAL: Critical file ${f} is missing!`);
    }
  }
  console.log('  ✔ Core service worker, content scripts, and studio pages verified');

  console.log('\n====================================================');
  console.log('  🎉 Chrome Web Store Upload Package Ready!         ');
  console.log(`  File: ${OUTPUT_ZIP_UPLOAD} (${zipKb} KB)`);
  console.log('====================================================\n');
}

buildChromeStorePackage().catch(err => {
  console.error('\n✖ Packaging failed:', err.message);
  process.exit(1);
});
