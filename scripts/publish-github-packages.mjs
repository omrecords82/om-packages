#!/usr/bin/env node
/**
 * Publish @om/{contracts,tokens,ui} to GitHub Packages as @omrecords82/*.
 *
 * GitHub Packages requires the npm scope to match the GitHub owner
 * (user/org). This repo's packages keep the @om/* brand in source; at
 * publish time names and workspace deps are remapped to @omrecords82/*.
 *
 * Usage:
 *   NODE_AUTH_TOKEN=<pat-with-write:packages> node scripts/publish-github-packages.mjs
 *   node scripts/publish-github-packages.mjs --dry-run
 *   node scripts/publish-github-packages.mjs --tag next
 *
 * Never commit tokens. Prefer env NODE_AUTH_TOKEN (or GITHUB_TOKEN in Actions).
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_SCOPE = "@om";
const PUBLISH_SCOPE = "@omrecords82";
const REGISTRY = "https://npm.pkg.github.com";
const REPO_URL = "https://github.com/omrecords82/om-packages.git";

/** Publish order: dependents last. */
const PACKAGES = [
  { dir: "packages/contracts", short: "contracts" },
  { dir: "packages/tokens", short: "tokens" },
  { dir: "packages/ui", short: "ui" },
];

function parseArgs(argv) {
  const opts = { dryRun: false, tag: "latest", skipBuild: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--skip-build") opts.skipBuild = true;
    else if (a === "--tag") opts.tag = argv[++i] || "latest";
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/publish-github-packages.mjs [--dry-run] [--skip-build] [--tag <dist-tag>]`);
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd || ROOT,
    env: opts.env || process.env,
    stdio: opts.stdio || "inherit",
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed with status ${r.status}`);
  }
  return r;
}

function remapName(name) {
  if (typeof name !== "string") return name;
  if (name.startsWith(`${SOURCE_SCOPE}/`)) {
    return `${PUBLISH_SCOPE}/${name.slice(SOURCE_SCOPE.length + 1)}`;
  }
  return name;
}

function remapDependencyMap(deps, versionBySourceName) {
  if (!deps || typeof deps !== "object") return deps;
  const out = {};
  for (const [key, value] of Object.entries(deps)) {
    const mappedKey = remapName(key);
    let mappedVal = value;
    if (typeof value === "string" && value.startsWith("workspace:")) {
      const ver = versionBySourceName[key];
      if (!ver) {
        throw new Error(`No published version for workspace dep ${key}`);
      }
      mappedVal = ver;
    } else if (typeof value === "string" && value.startsWith(`${SOURCE_SCOPE}/`)) {
      mappedVal = remapName(value);
    }
    out[mappedKey] = mappedVal;
  }
  return out;
}

function loadPackageJson(relDir) {
  return JSON.parse(readFileSync(join(ROOT, relDir, "package.json"), "utf8"));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const token = process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN || "";

  if (!opts.dryRun && !token) {
    console.error(
      "Missing NODE_AUTH_TOKEN (or GITHUB_TOKEN). Create a classic PAT with write:packages + read:packages + repo, then:\n" +
        "  export NODE_AUTH_TOKEN=<pat>\n" +
        "  node scripts/publish-github-packages.mjs",
    );
    process.exit(1);
  }

  const versionBySourceName = {};
  for (const pkg of PACKAGES) {
    const pj = loadPackageJson(pkg.dir);
    versionBySourceName[pj.name] = pj.version;
    if (pj.private === true) {
      console.warn(
        `Note: ${pj.name} has private:true in source; publish staging clears it.`,
      );
    }
    if (!existsSync(join(ROOT, pkg.dir, "dist")) && opts.skipBuild) {
      console.error(`Missing dist for ${pkg.dir}; run a build or omit --skip-build`);
      process.exit(1);
    }
  }

  if (!opts.skipBuild) {
    console.log("Building packages…");
    run("corepack", ["pnpm", "build"]);
  }

  const stagingRoot = mkdtempSync(join(tmpdir(), "om-gh-pkg-"));
  console.log(`Staging under ${stagingRoot}`);

  const published = [];

  try {
    for (const pkg of PACKAGES) {
      const srcPj = loadPackageJson(pkg.dir);
      const publishName = remapName(srcPj.name);
      const stageDir = join(stagingRoot, pkg.short);
      mkdirSync(stageDir, { recursive: true });

      const distSrc = join(ROOT, pkg.dir, "dist");
      if (!existsSync(distSrc)) {
        throw new Error(`Build output missing: ${distSrc}`);
      }
      cpSync(distSrc, join(stageDir, "dist"), { recursive: true });

      const staged = {
        ...srcPj,
        name: publishName,
        private: false,
        publishConfig: {
          registry: REGISTRY,
          access: "restricted",
          tag: opts.tag,
        },
        repository: {
          type: "git",
          url: REPO_URL,
          directory: pkg.dir,
        },
        dependencies: remapDependencyMap(srcPj.dependencies, versionBySourceName),
        peerDependencies: remapDependencyMap(
          srcPj.peerDependencies,
          versionBySourceName,
        ),
        optionalDependencies: remapDependencyMap(
          srcPj.optionalDependencies,
          versionBySourceName,
        ),
        devDependencies: undefined,
        scripts: undefined,
      };
      delete staged.devDependencies;
      delete staged.scripts;

      writeFileSync(join(stageDir, "package.json"), `${JSON.stringify(staged, null, 2)}\n`);

      // Staging .npmrc only (temp dir, never committed). Token written for real publish only.
      const npmrcBody = opts.dryRun
        ? `${PUBLISH_SCOPE}:registry=${REGISTRY}\nalways-auth=true\n`
        : `${PUBLISH_SCOPE}:registry=${REGISTRY}\n//npm.pkg.github.com/:_authToken=${token}\nalways-auth=true\n`;
      writeFileSync(join(stageDir, ".npmrc"), npmrcBody);

      console.log(
        `${opts.dryRun ? "[dry-run] " : ""}Publishing ${srcPj.name}@${srcPj.version} as ${publishName}@${srcPj.version} (tag=${opts.tag})`,
      );

      if (opts.dryRun) {
        run("npm", ["pack", "--dry-run"], { cwd: stageDir });
      } else {
        run("npm", ["publish", "--access", "restricted", "--tag", opts.tag], {
          cwd: stageDir,
          env: {
            ...process.env,
            NODE_AUTH_TOKEN: token,
          },
        });
      }

      published.push({
        source: srcPj.name,
        published: publishName,
        version: srcPj.version,
        tag: opts.tag,
      });
    }
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }

  console.log("\nPublish summary:");
  for (const row of published) {
    console.log(`  ${row.source} → ${row.published}@${row.version} (${row.tag})`);
  }
  console.log(
    "\nConsumers: map @omrecords82:registry=https://npm.pkg.github.com and prefer npm aliases, e.g.\n" +
      '  "@om/ui": "npm:@omrecords82/ui@0.1.0"',
  );
}

main();
