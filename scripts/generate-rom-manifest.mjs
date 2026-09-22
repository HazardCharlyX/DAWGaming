import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ROMS_DIR = path.join(rootDir, 'public', 'roms');
const OUTPUT_FILE = path.join(rootDir, 'src', 'data', 'roms-manifest.json');

const PLATFORM_EXTENSIONS = {
  gba: ['.gba', '.zip'],
  nds: ['.nds', '.zip'],
  psp: ['.iso', '.cso'],
  n64: ['.z64', '.n64', '.v64'],
};

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];

function formatTitle(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function scanRoms() {
  console.log('[ROM Manifest] Scanning ROMs in:', ROMS_DIR);

  if (!fs.existsSync(ROMS_DIR)) {
    fs.mkdirSync(ROMS_DIR, { recursive: true });
  }

  const manifest = [];
  const countsByPlatform = {};

  const platforms = fs.readdirSync(ROMS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const platform of platforms) {
    const platformDir = path.join(ROMS_DIR, platform);
    const validExtensions = PLATFORM_EXTENSIONS[platform] || ['.gba', '.nds', '.zip'];
    countsByPlatform[platform] = 0;

    const files = fs.readdirSync(platformDir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!validExtensions.includes(ext)) continue;

      const slug = path.basename(file, ext);

      // Security check: only allow safe characters in slug
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        console.warn(`[ROM Manifest] Skipping unsafe filename: ${file}`);
        continue;
      }

      const romFilePath = path.join(platformDir, file);
      const stats = fs.statSync(romFilePath);

      // Optional metadata .json
      let metadata = {};
      const metaPath = path.join(platformDir, `${slug}.json`);
      if (fs.existsSync(metaPath)) {
        try {
          const rawMeta = fs.readFileSync(metaPath, 'utf8');
          metadata = JSON.parse(rawMeta);
        } catch (err) {
          console.warn(`[ROM Manifest] Error parsing metadata for ${slug}:`, err.message);
        }
      }

      // Optional cover image (.webp, .png, .jpg)
      let coverUrl = undefined;
      let hasCustomCover = false;
      for (const imgExt of IMAGE_EXTENSIONS) {
        const coverCandidate = `${slug}${imgExt}`;
        const coverPath = path.join(platformDir, coverCandidate);
        if (fs.existsSync(coverPath)) {
          coverUrl = `/roms/${platform}/${coverCandidate}`;
          hasCustomCover = true;
          break;
        }
      }

      // Also check if cover was specified explicitly in metadata
      if (!coverUrl && metadata.cover) {
        coverUrl = metadata.cover;
        hasCustomCover = true;
      }

      const entry = {
        id: `${platform}-${slug}`,
        slug,
        title: metadata.title || formatTitle(slug),
        platform,
        genre: metadata.genre || 'adventure',
        year: metadata.year || undefined,
        developer: metadata.developer || undefined,
        description:
          metadata.description ||
          `Juego para ${platform.toUpperCase()} listo para emular en navegador.`,
        romFile: `/roms/${platform}/${file}`,
        romSource: 'local',
        romSizeBytes: stats.size,
        romSizeFormatted: formatBytes(stats.size),
        coverUrl: coverUrl || undefined,
        hasCustomCover,
        featured: Boolean(metadata.featured),
        controlsHint: metadata.controlsHint || undefined,
        createdAt: stats.mtime.toISOString(),
      };

      manifest.push(entry);
      countsByPlatform[platform] = (countsByPlatform[platform] || 0) + 1;
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');

  const summary = Object.entries(countsByPlatform)
    .map(([p, count]) => `${count} ${p.toUpperCase()}`)
    .join(', ');

  console.log(`[ROM Manifest] Generated ${manifest.length} entries (${summary}) -> ${OUTPUT_FILE}`);
}

scanRoms();
