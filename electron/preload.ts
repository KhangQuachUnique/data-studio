import { contextBridge, ipcRenderer } from "electron";
import type { ImportCsvInput } from "@shared/data-source/dtos";
import type { CreateWorkspaceInput } from "@shared/workspace/dtos";

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
  previewDataSource: (
    workspaceId: string,
    dataSourceId: string,
    rowLimit?: number,
  ) =>
    ipcRenderer.invoke(
      "dataSource:preview",
      workspaceId,
      dataSourceId,
      rowLimit,
    ),
  deleteDataSource: (workspaceId: string, dataSourceId: string) =>
    ipcRenderer.invoke("dataSource:delete", workspaceId, dataSourceId),
});
