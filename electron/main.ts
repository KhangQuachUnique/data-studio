import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
  type OpenDialogOptions,
} from "electron";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CreateWorkspaceInput } from "@shared/types/Workspace";
import type { ImportCsvInput } from "@shared/types/DataSource";
import { createSqliteConnection, type SqliteDatabase } from "@core/db/SqliteConnection";
import { SqliteMigrationRunner } from "@core/db/SqliteMigrationRunner";
import { SqliteDataSourceRepository } from "@core/repositories/data-source/DataSourceRepositoryImpl";
import { SqliteDatasetVersionRepository } from "@core/repositories/dataset-version/DatasetVersionRepositoryImpl";
import { SqliteAppSettingsRepository } from "@core/repositories/settings/SqliteAppSettingsRepository";
import { SqliteWorkspaceRepository } from "@core/repositories/workspace/WorkspaceRepositoryImpl";
import { AppBootstrapService } from "@core/services/AppBootstrapService";
import { DataSourceService } from "@core/services/DataSourceService";
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
  dataSourceService: DataSourceService;
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
  const dataSourceRepository = new SqliteDataSourceRepository(db);
  const datasetVersionRepository = new SqliteDatasetVersionRepository(db);
  const appSettingsRepository = new SqliteAppSettingsRepository(db);
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    appPaths.workspacesPath,
    appSettingsRepository,
  );
  const dataSourceService = new DataSourceService(
    workspaceRepository,
    dataSourceRepository,
    datasetVersionRepository,
  );

  return {
    db,
    dataSourceService,
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

  ipcMain.handle("workspace:get", (_event, workspaceId: string) => {
    return dependencies.workspaceService.getWorkspaceDetail(workspaceId);
  });

  ipcMain.handle("workspace:get-last-opened", () => {
    return dependencies.workspaceService.getLastOpenedWorkspace();
  });

  ipcMain.handle("workspace:set-last-opened", (_event, workspaceId: string) => {
    return dependencies.workspaceService.setLastOpenedWorkspace(workspaceId);
  });

  ipcMain.handle(
    "workspace:create",
    (_event, input: CreateWorkspaceInput) => {
      return dependencies.workspaceService.createWorkspace(input);
    },
  );

  ipcMain.handle("workspace:archive", (_event, workspaceId: string) => {
    return dependencies.workspaceService.archiveWorkspace(workspaceId);
  });

  ipcMain.handle("workspace:unarchive", (_event, workspaceId: string) => {
    return dependencies.workspaceService.unarchiveWorkspace(workspaceId);
  });

  ipcMain.handle("workspace:open-folder", async (_event, workspaceId: string) => {
    const detail = await dependencies.workspaceService.getWorkspaceDetail(
      workspaceId,
    );

    await shell.openPath(detail.workspace.path);
  });

  ipcMain.handle("dialog:select-csv-file", async () => {
    const options: OpenDialogOptions = {
      filters: [{ name: "CSV files", extensions: ["csv"] }],
      properties: ["openFile"],
      title: "Select CSV file",
    };
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0] ?? null;
  });

  ipcMain.handle("dataSource:list", (_event, workspaceId: string) => {
    return dependencies.dataSourceService.listDataSources(workspaceId);
  });

  ipcMain.handle(
    "dataSource:importCsv",
    (_event, input: ImportCsvInput) => {
      return dependencies.dataSourceService.importCsv(input);
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
