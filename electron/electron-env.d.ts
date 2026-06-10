/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

interface Window {
  api: {
    listWorkspaces: () => Promise<
      import("@shared/types/Workspace").Workspace[]
    >;
    getWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/types/Workspace").WorkspaceDetail>;
    getLastOpenedWorkspace: () => Promise<
      import("@shared/types/Workspace").Workspace | null
    >;
    setLastOpenedWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/types/Workspace").Workspace>;
    createWorkspace: (
      input: import("@shared/types/Workspace").CreateWorkspaceInput,
    ) => Promise<import("@shared/types/Workspace").Workspace>;
    archiveWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/types/Workspace").Workspace>;
    unarchiveWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/types/Workspace").Workspace>;
    openWorkspaceFolder: (workspaceId: string) => Promise<void>;
    selectCsvFile: () => Promise<string | null>;
    listDataSources: (
      workspaceId: string,
    ) => Promise<import("@shared/types/DataSource").DataSourceListItem[]>;
    importCsv: (
      input: import("@shared/types/DataSource").ImportCsvInput,
    ) => Promise<import("@shared/types/DataSource").ImportCsvResult>;
    previewDataSource: (
      workspaceId: string,
      dataSourceId: string,
      rowLimit?: number,
    ) => Promise<import("@shared/types/DataSource").DataSourcePreview>;
    deleteDataSource: (
      workspaceId: string,
      dataSourceId: string,
    ) => Promise<void>;
  };
}
