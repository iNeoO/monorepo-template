import { execSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Answers } from "./questions.js";
import { VERSIONS } from "./versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(__dirname, "../templates");

const SKIP = new Set([
	"dist",
	"node_modules",
	"generated",
	".git",
	"routeTree.gen.ts",
]);

function copyDir(src: string, dest: string) {
	cpSync(src, dest, {
		recursive: true,
		filter: (srcPath: string) => !SKIP.has(basename(srcPath)),
	});
}

function replaceInDir(dir: string, from: string, to: string) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP.has(entry.name)) replaceInDir(full, from, to);
		} else {
			try {
				const content = readFileSync(full, "utf-8");
				if (content.includes(from))
					writeFileSync(full, content.replaceAll(from, to));
			} catch {
				// skip binary files that can't be read as utf-8
			}
		}
	}
}

function buildRootPackageJson(
	name: string,
	backend: string,
	frontend: string,
	orm: string,
) {
	const scripts: Record<string, string> = {};

	if (backend === "hono") {
		scripts["hono:dev"] = `dotenv -e .env -- pnpm --filter @${name}/hono dev`;
		scripts["hono:build"] = `pnpm --filter @${name}/hono build`;
		scripts["common:build"] = `pnpm --filter @${name}/common build`;
		scripts["infra:build"] = `pnpm --filter @${name}/infra build`;
		scripts["services:build"] = `pnpm --filter @${name}/services build`;
		scripts["dev:libs:build"] =
			"pnpm run common:build && pnpm run infra:build && pnpm run prisma:build && pnpm run services:build";
	}

	if (frontend === "react") {
		scripts["react:dev"] = `dotenv -e .env -- pnpm --filter @${name}/react dev`;
		scripts["react:build"] = `pnpm --filter @${name}/react build`;
	}

	if (orm === "prisma") {
		scripts["prisma:generate"] =
			`dotenv -e .env -- pnpm --filter @${name}/prisma generate`;
		scripts["prisma:migrate"] =
			`dotenv -e .env -- pnpm --filter @${name}/prisma migrate`;
		scripts["prisma:deploy"] =
			`dotenv -e .env -- pnpm --filter @${name}/prisma deploy`;
		scripts["prisma:build"] = `pnpm --filter @${name}/prisma build`;
	}

	const runtimeParts: string[] = [];
	if (backend === "hono") runtimeParts.push("pnpm run hono:dev");
	if (frontend === "react") runtimeParts.push("pnpm run react:dev");

	if (runtimeParts.length > 1) {
		scripts["dev:runtime"] = `concurrently -k "${runtimeParts.join('" "')}"`;
	} else if (runtimeParts.length === 1) {
		scripts["dev:runtime"] = runtimeParts[0];
	}

	const devParts: string[] = [];
	if (backend === "hono") devParts.push("pnpm run dev:libs:build");
	if (runtimeParts.length > 0) devParts.push("pnpm run dev:runtime");
	if (devParts.length > 0) scripts.dev = devParts.join(" && ");

	const devDeps: Record<string, string> = {};
	if (runtimeParts.length > 1) devDeps.concurrently = VERSIONS.concurrently;

	return {
		name,
		license: "MIT",
		scripts,
		type: "module",
		version: "1.0.0",
		packageManager: `pnpm@${VERSIONS.pnpm}`,
		dependencies: {
			"dotenv-cli": VERSIONS["dotenv-cli"],
		},
		...(Object.keys(devDeps).length > 0 && { devDependencies: devDeps }),
	};
}

function buildWorkspaceYaml(
	backend: string,
	frontend: string,
	orm: string,
): string {
	const pkgs = ["'packages/*'"];
	if (backend !== "none" || frontend !== "none") pkgs.push("'apps/*'");
	if (orm === "prisma") pkgs.push('"db/*"');

	const allowBuilds: string[] = [];
	if (orm === "prisma") {
		allowBuilds.push(
			"  '@prisma/engines': true",
			"  esbuild: true",
			"  prisma: true",
			"  protobufjs: true",
		);
	}

	const catalog: string[] = [
		`  '@biomejs/biome': ${VERSIONS["@biomejs/biome"]}`,
	];
	if (backend === "hono") {
		catalog.push(
			`  '@hono/node-server': ${VERSIONS["@hono/node-server"]}`,
			`  hono: '${VERSIONS.hono}'`,
			`  hono-openapi: "${VERSIONS["hono-openapi"]}"`,
		);
	}
	catalog.push(
		`  '@types/node': ${VERSIONS["@types/node"]}`,
		`  typescript: ${VERSIONS.typescript}`,
		`  tsx: "${VERSIONS.tsx}"`,
		`  vitest: ${VERSIONS.vitest}`,
		`  zod: ${VERSIONS.zod}`,
	);

	return [
		"packages:",
		...pkgs.map((p) => `  - ${p}`),
		"",
		"allowBuilds:",
		...allowBuilds,
		"",
		"catalog:",
		...catalog,
		"",
	].join("\n");
}

export async function scaffold(answers: Answers) {
	const { projectName, backend, frontend, orm, skills } = answers;
	const dest = resolve(process.cwd(), projectName);

	if (existsSync(dest)) {
		throw new Error(`Directory "${projectName}" already exists.`);
	}

	console.log(`\nScaffolding ${projectName}...`);
	mkdirSync(dest, { recursive: true });

	copyDir(join(TEMPLATES, "base"), dest);

	copyDir(join(TEMPLATES, "packages/common"), join(dest, "packages/common"));

	if (backend === "hono") {
		copyDir(join(TEMPLATES, "backend/hono"), join(dest, "apps/hono"));
		copyDir(join(TEMPLATES, "packages/infra-hono"), join(dest, "packages/infra"));
		copyDir(join(TEMPLATES, "packages/services"), join(dest, "packages/services"));
	}

	if (frontend === "react") {
		copyDir(join(TEMPLATES, "frontend/react"), join(dest, "apps/react"));
	}

	if (orm === "prisma") {
		copyDir(join(TEMPLATES, "orm/prisma"), join(dest, "db/prisma"));
	}

	for (const skill of skills) {
		const skillDest = join(dest, ".claude", "skills", skill);
		mkdirSync(skillDest, { recursive: true });
		copyDir(join(TEMPLATES, "skills", skill), skillDest);
	}

	writeFileSync(
		join(dest, "package.json"),
		JSON.stringify(
			buildRootPackageJson(projectName, backend, frontend, orm),
			null,
			"\t",
		),
	);
	writeFileSync(
		join(dest, "pnpm-workspace.yaml"),
		buildWorkspaceYaml(backend, frontend, orm),
	);

	replaceInDir(dest, "monorepo-template", projectName);

	console.log("Installing dependencies (this may take a moment)...");
	execSync("pnpm install", { cwd: dest, stdio: "inherit" });

	console.log(`\n✔ Done!\n`);
	console.log(`  cd ${projectName}`);
	if (orm === "prisma") {
		console.log(`  cp .env.example .env  # fill in your values`);
		console.log(`  docker compose up -d`);
		console.log(`  pnpm common:build && pnpm infra:build`);
		console.log(`  pnpm prisma:migrate`);
		console.log(`  pnpm prisma:generate`);
	}
	console.log(`  pnpm dev\n`);
}
