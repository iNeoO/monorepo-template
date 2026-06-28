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
import { buildRootPackageJson } from "./builders/package-json.js";
import { buildWorkspaceYaml } from "./builders/pnpm-workspace.js";
import { buildReadme } from "./builders/readme.js";
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

function replaceVersions(dir: string) {
	for (const [pkg, version] of Object.entries(VERSIONS)) {
		replaceInDir(dir, `__${pkg}__`, version);
	}
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

function filterOrmSections(content: string, orm: string): string {
	const keep = orm === "prisma" ? "PRISMA" : "DRIZZLE";
	const drop = orm === "prisma" ? "DRIZZLE" : "PRISMA";
	return content
		.replace(new RegExp(`<!--${keep}_START-->\\n?`, "g"), "")
		.replace(new RegExp(`<!--${keep}_END-->\\n?`, "g"), "")
		.replace(new RegExp(`<!--${drop}_START-->[\\s\\S]*?<!--${drop}_END-->\\n?`, "g"), "");
}

function applyOrmFilterToDir(dir: string, orm: string) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			applyOrmFilterToDir(full, orm);
		} else if (entry.name.endsWith(".md")) {
			const content = readFileSync(full, "utf-8");
			if (content.includes("<!--PRISMA_START-->") || content.includes("<!--DRIZZLE_START-->")) {
				writeFileSync(full, filterOrmSections(content, orm));
			}
		}
	}
}

function patchHonoForDrizzle(honoDir: string) {
	const pkgPath = join(honoDir, "package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
	delete pkg.dependencies["@monorepo-template/prisma"];
	pkg.dependencies["@monorepo-template/drizzle"] = "workspace:*";
	writeFileSync(pkgPath, JSON.stringify(pkg, null, "\t"));

	writeFileSync(
		join(honoDir, "src/services/container.ts"),
		`import { type Database, db } from "@monorepo-template/drizzle";
import { PostsService, UsersService } from "@monorepo-template/services";

export type AppServices = {
	db: Database;
	posts: PostsService;
	users: UsersService;
};

export const createServices = (): AppServices => {
	return {
		db,
		posts: new PostsService(db),
		users: new UsersService(db),
	};
};

export const services = createServices();
`,
	);

	const appPath = join(honoDir, "src/app.ts");
	const app = readFileSync(appPath, "utf-8");
	writeFileSync(appPath, app.replace("services.prisma", "services.db"));

	const indexPath = join(honoDir, "src/index.ts");
	const index = readFileSync(indexPath, "utf-8");
	writeFileSync(
		indexPath,
		index.replace("await services.db.$disconnect();", "await services.db.$client.end();"),
	);

	const healthSchemaPath = join(honoDir, "src/modules/health/health.schema.ts");
	const healthSchema = readFileSync(healthSchemaPath, "utf-8");
	writeFileSync(healthSchemaPath, healthSchema.replace("prisma:", "db:"));
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
		if (orm === "prisma") {
			copyDir(join(TEMPLATES, "packages/services-prisma"), join(dest, "packages/services"));
		} else if (orm === "drizzle") {
			copyDir(join(TEMPLATES, "packages/services-drizzle"), join(dest, "packages/services"));
			patchHonoForDrizzle(join(dest, "apps/hono"));
		} else {
			const honoPkgPath = join(dest, "apps/hono/package.json");
			const honoPkg = JSON.parse(readFileSync(honoPkgPath, "utf-8"));
			delete honoPkg.dependencies["@monorepo-template/services"];
			delete honoPkg.dependencies["@monorepo-template/prisma"];
			writeFileSync(honoPkgPath, JSON.stringify(honoPkg, null, "\t"));
		}
	}

	if (frontend === "react") {
		copyDir(join(TEMPLATES, "frontend/react"), join(dest, "apps/react"));
	}

	if (orm === "prisma") {
		copyDir(join(TEMPLATES, "orm/prisma"), join(dest, "db/prisma"));
	}

	if (orm === "drizzle") {
		copyDir(join(TEMPLATES, "orm/drizzle"), join(dest, "db/drizzle"));
	}

	for (const skill of skills) {
		const skillDest = join(dest, ".claude", "skills", skill);
		mkdirSync(skillDest, { recursive: true });
		copyDir(join(TEMPLATES, "skills", skill), skillDest);
		if (orm !== "none") applyOrmFilterToDir(skillDest, orm);
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
	writeFileSync(
		join(dest, "README.md"),
		buildReadme(projectName, backend, frontend, orm),
	);

	replaceVersions(dest);
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
	if (orm === "drizzle") {
		console.log(`  cp .env.example .env  # fill in your values`);
		console.log(`  docker compose up -d`);
		console.log(`  pnpm common:build && pnpm infra:build`);
		console.log(`  pnpm drizzle:generate`);
		console.log(`  pnpm drizzle:push`);
	}
	console.log(`  pnpm dev\n`);
}
