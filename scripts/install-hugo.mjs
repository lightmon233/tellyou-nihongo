import { createWriteStream, existsSync } from 'node:fs';
import { chmod, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:https';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const args = parseArgs(process.argv.slice(2));
const version = resolveVersion(args.version || 'otherDependencies.hugo');
const extended = args.extended === true;
const destination = resolve(projectRoot, args.destination || 'node_modules/.bin/hugo');
const platform = process.platform;
const arch = normalizeArch(process.arch);
const variant = extended ? 'hugo_extended' : 'hugo';
const assetPattern = new RegExp(`^${variant}_${escapeRegExp(version)}_${platformName(platform)}-${arch}\\.(zip|tar\\.gz)$`);

if (!['win32', 'linux'].includes(platform)) {
  throw new Error(`Unsupported platform for this project installer: ${platform}`);
}

console.log('');
console.log('Hugo Installer');
console.log('');
console.log(`> Resolving Hugo ${version}${extended ? ' extended' : ''} for ${platform}/${arch}`);

if (await existingBinaryMatches()) {
  console.log('> Existing Hugo binary matches requested version');
  console.log('');
  process.exit(0);
}

const release = await getJson(`https://api.github.com/repos/gohugoio/hugo/releases/tags/v${version}`);
const asset = release.assets.find((item) => assetPattern.test(item.name));

if (!asset) {
  const names = release.assets.map((item) => item.name).join('\n  ');
  throw new Error(`Could not find a matching Hugo binary asset. Looked for ${assetPattern}.\nAvailable assets:\n  ${names}`);
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const archivePath = join(destination, asset.name);
console.log(`> Downloading ${asset.browser_download_url}`);
await download(asset.browser_download_url, archivePath);

console.log('> Extracting binary');
const extract = spawnSync('tar', ['-xf', archivePath, '-C', destination], { stdio: 'inherit' });
if (extract.status !== 0) {
  throw new Error(`Failed to extract ${asset.name}; make sure the system tar command is available.`);
}
await rm(archivePath, { force: true });

const binaryName = platform === 'win32' ? 'hugo.exe' : 'hugo';
const binaryPath = await findFile(destination, binaryName);
if (!binaryPath) {
  throw new Error(`Could not find ${binaryName} after extracting ${asset.name}.`);
}

const targetBinaryPath = join(destination, binaryName);
if (binaryPath !== targetBinaryPath) {
  await copyFile(binaryPath, targetBinaryPath);
}
await chmod(targetBinaryPath, 0o755);

await writeFile(join(destination, 'version.json'), JSON.stringify({
  arch,
  extended,
  os: platform,
  version,
}, null, 2));

const versionCheck = spawnSync(targetBinaryPath, ['version'], { encoding: 'utf8' });
if (versionCheck.status !== 0) {
  throw new Error(versionCheck.stderr || `Failed to verify ${targetBinaryPath}`);
}

console.log('');
console.log(`Hugo is now available in "${destination}".`);
console.log(versionCheck.stdout.trim());
console.log('');

function parseArgs(input) {
  const parsed = {};
  for (let index = 0; index < input.length; index += 1) {
    const arg = input[index];
    if (arg === '--extended') {
      parsed.extended = true;
    } else if (arg.startsWith('--')) {
      parsed[arg.slice(2)] = input[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function resolveVersion(value) {
  if (/^\d+\.\d+\.\d+$/.test(value)) {
    return value;
  }

  return value.split('.').reduce((current, key) => current?.[key], packageJson);
}

function normalizeArch(value) {
  if (value === 'x64') return 'amd64';
  if (value === 'arm64') return 'arm64';
  throw new Error(`Unsupported architecture: ${value}`);
}

function platformName(value) {
  if (value === 'win32') return 'windows';
  if (value === 'linux') return 'linux';
  if (value === 'darwin') return 'darwin';
  throw new Error(`Unsupported platform: ${value}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getJson(url) {
  return new Promise((resolvePromise, reject) => {
    get(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'tellyou-nihongo-hugo-installer',
      },
    }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Request failed with ${response.statusCode}: ${url}`));
        response.resume();
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolvePromise(JSON.parse(body));
      });
    }).on('error', reject);
  });
}

function download(url, outputPath) {
  return new Promise((resolvePromise, reject) => {
    get(url, { headers: { 'User-Agent': 'tellyou-nihongo-hugo-installer' } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        download(response.headers.location, outputPath).then(resolvePromise, reject);
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Download failed with ${response.statusCode}: ${url}`));
        response.resume();
        return;
      }

      const file = createWriteStream(outputPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolvePromise);
      });
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function findFile(root, fileName) {
  const entries = await import('node:fs/promises').then(({ readdir }) => readdir(root, { withFileTypes: true }));

  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const found = await findFile(fullPath, fileName);
      if (found) return found;
    }
  }

  return existsSync(join(root, fileName)) ? join(root, fileName) : null;
}

async function existingBinaryMatches() {
  const binaryName = platform === 'win32' ? 'hugo.exe' : 'hugo';
  const binaryPath = join(destination, binaryName);
  const versionPath = join(destination, 'version.json');

  if (!existsSync(binaryPath) || !existsSync(versionPath)) {
    return false;
  }

  try {
    const installed = JSON.parse(await readFile(versionPath, 'utf8'));
    if (
      installed.arch !== arch ||
      installed.extended !== extended ||
      installed.os !== platform ||
      installed.version !== version
    ) {
      return false;
    }

    const versionCheck = spawnSync(binaryPath, ['version'], { encoding: 'utf8' });
    return versionCheck.status === 0 && versionCheck.stdout.includes(`v${version}`);
  } catch {
    return false;
  }
}
