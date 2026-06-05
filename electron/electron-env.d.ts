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
    createWorkspace: (
      input: import("@shared/types/Workspace").CreateWorkspaceInput,
    ) => Promise<import("@shared/types/Workspace").Workspace>;
  };
}
