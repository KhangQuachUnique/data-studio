import { app, BrowserWindow, ipcMain } from "electron";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CreateWorkspaceInput } from "@shared/types/Workspace";
import { createSqliteConnection, type SqliteDatabase } from "@core/db/SqliteConnection";
import { SqliteMigrationRunner } from "@core/db/SqliteMigrationRunner";
import { SqliteWorkspaceRepository } from "@core/repositories/workspace/WorkspaceRepositoryImpl";
import { AppBootstrapService } from "@core/services/AppBootstrapService";
import { WorkspaceService } from "@core/services/WorkspaceService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

interface MainContainer {
  db: SqliteDatabase;
  workspaceService: WorkspaceService;
}

let win: BrowserWindow | null;
let container: MainContainer | null = null;

async function createContainer(): Promise<MainContainer> {
  const bootstrap = new AppBootstrapService();
  const appPaths = await bootstrap.init();
  const db = createSqliteConnection(appPaths.databasePath);

  new SqliteMigrationRunner(db, resolveMigrationsDir()).run();

  const workspaceRepository = new SqliteWorkspaceRepository(db);
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    appPaths.workspacesPath,
  );

  return {
    db,
    workspaceService,
  };
}

function resolveMigrationsDir(): string {
  const sourceMigrationsDir = path.join(
    process.env.APP_ROOT,
    "electron",
    "core",
    "db",
    "migrations",
  );

  if (existsSync(sourceMigrationsDir)) {
    return sourceMigrationsDir;
  }

  return path.join(process.resourcesPath, "migrations");
}

function registerIpcHandlers(dependencies: MainContainer): void {
  ipcMain.handle("workspace:list", () => {
    return dependencies.workspaceService.listWorkspaces();
  });

  ipcMain.handle(
    "workspace:create",
    (_event, input: CreateWorkspaceInput) => {
      return dependencies.workspaceService.createWorkspace(input);
    },
  );
}

function createWindow(): void {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("before-quit", () => {
  container?.db.close();
  container = null;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  container = await createContainer();
  registerIpcHandlers(container);
  createWindow();
});
