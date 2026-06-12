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
      import("@shared/workspace/entities").Workspace[]
    >;
    getWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/workspace/entities").WorkspaceDetail>;
    getLastOpenedWorkspace: () => Promise<
      import("@shared/workspace/entities").Workspace | null
    >;
    setLastOpenedWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/workspace/entities").Workspace>;
    createWorkspace: (
      input: import("@shared/workspace/dtos").CreateWorkspaceInput,
    ) => Promise<import("@shared/workspace/entities").Workspace>;
    archiveWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/workspace/entities").Workspace>;
    unarchiveWorkspace: (
      workspaceId: string,
    ) => Promise<import("@shared/workspace/entities").Workspace>;
    openWorkspaceFolder: (workspaceId: string) => Promise<void>;
    selectCsvFile: () => Promise<string | null>;
    listDataSources: (
      workspaceId: string,
    ) => Promise<import("@shared/data-source/entities").DataSourceListItem[]>;
    importCsv: (
      input: import("@shared/data-source/dtos").ImportCsvInput,
    ) => Promise<import("@shared/data-source/dtos").ImportCsvResult>;
    previewDataSource: (
      workspaceId: string,
      dataSourceId: string,
      rowLimit?: number,
    ) => Promise<import("@shared/data-source/entities").DataSourcePreview>;
    deleteDataSource: (
      workspaceId: string,
      dataSourceId: string,
    ) => Promise<void>;
    getDatasetVersionProfileReport: (
      datasetVersionId: string,
    ) => Promise<import("@shared/profile/dtos").GetDatasetVersionProfileReportResponseDto>;
    runDatasetVersionProfile: (
      datasetVersionId: string,
    ) => Promise<import("@shared/profile/dtos").RunDatasetVersionProfileResponseDto>;
  };
}
