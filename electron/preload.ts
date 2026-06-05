import { contextBridge, ipcRenderer } from "electron";
import type { CreateWorkspaceInput } from "@shared/types/Workspace";

contextBridge.exposeInMainWorld("api", {
  listWorkspaces: () => ipcRenderer.invoke("workspace:list"),
  createWorkspace: (input: CreateWorkspaceInput) =>
    ipcRenderer.invoke("workspace:create", input),
});
