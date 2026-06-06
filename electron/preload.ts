import { contextBridge, ipcRenderer } from "electron";
import type { CreateWorkspaceInput } from "@shared/types/Workspace";
import type { ImportCsvInput } from "@shared/types/DataSource";

contextBridge.exposeInMainWorld("api", {
  listWorkspaces: () => ipcRenderer.invoke("workspace:list"),
  getWorkspace: (workspaceId: string) =>
    ipcRenderer.invoke("workspace:get", workspaceId),
  getLastOpenedWorkspace: () => ipcRenderer.invoke("workspace:get-last-opened"),
  setLastOpenedWorkspace: (workspaceId: string) =>
    ipcRenderer.invoke("workspace:set-last-opened", workspaceId),
  createWorkspace: (input: CreateWorkspaceInput) =>
    ipcRenderer.invoke("workspace:create", input),
  archiveWorkspace: (workspaceId: string) =>
    ipcRenderer.invoke("workspace:archive", workspaceId),
  unarchiveWorkspace: (workspaceId: string) =>
    ipcRenderer.invoke("workspace:unarchive", workspaceId),
  openWorkspaceFolder: (workspaceId: string) =>
    ipcRenderer.invoke("workspace:open-folder", workspaceId),
  selectCsvFile: () => ipcRenderer.invoke("dialog:select-csv-file"),
  listDataSources: (workspaceId: string) =>
    ipcRenderer.invoke("dataSource:list", workspaceId),
  importCsv: (input: ImportCsvInput) =>
    ipcRenderer.invoke("dataSource:importCsv", input),
});
