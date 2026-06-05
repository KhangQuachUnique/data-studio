import path from "path";
import fs from "fs/promises";
import { app } from "electron";

export interface AppPaths {
  userDataPath: string;
  databasePath: string;
  workspacesPath: string;
  configPath: string;
  logsPath: string;
}

export class AppBootstrapService {
  private readonly paths: AppPaths;

  constructor() {
    const userDataPath = app.getPath("userData");

    this.paths = {
      userDataPath,
      databasePath: path.join(userDataPath, "app.sqlite"),
      workspacesPath: path.join(userDataPath, "workspaces"),
      configPath: path.join(userDataPath, "config.json"),
      logsPath: path.join(userDataPath, "logs"),
    };
  }

  async init(): Promise<AppPaths> {
    await this.ensureDirectories();
    await this.ensureConfigFile();
    return this.paths;
  }

  getPaths(): AppPaths {
    return this.paths;
  }

  // Ensures that necessary directories exist
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.paths.userDataPath, { recursive: true });
    await fs.mkdir(this.paths.workspacesPath, { recursive: true });
    await fs.mkdir(this.paths.logsPath, { recursive: true });
  }

  // Ensures that the config file exists, if not creates it with default values
  private async ensureConfigFile(): Promise<void> {
    const exist = await this.exists(this.paths.configPath);

    if (exist) {
      return;
    }

    const defaultConfig = {
      appName: "Data Prep App",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      this.paths.configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8",
    );
  }

  // Helper method to check if a file exists
  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
