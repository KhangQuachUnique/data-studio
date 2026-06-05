import { CreateWorkspaceForm } from "@renderer/features/workspaces/components/CreateWorkspaceForm";
import { WorkspaceDiagnostics } from "@renderer/features/workspaces/components/WorkspaceDiagnostics";
import { WorkspaceList } from "@renderer/features/workspaces/components/WorkspaceList";
import { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import "@renderer/features/workspaces/styles/workspaces.css";

export function WorkspacesPage() {
  const {
    workspaces,
    error,
    isCreating,
    isLoading,
    createWorkspace,
    loadWorkspaces,
  } = useWorkspaces();

  return (
    <main className="app-shell">
      <section className="workspace-header">
        <p className="eyebrow">DataPrep Studio</p>
        <h1>Workspaces</h1>
        <p className="summary">
          Validate the current workspace flow from renderer UI to preload IPC,
          Electron services, SQLite metadata, and local folders.
        </p>
      </section>

      <WorkspaceDiagnostics
        isCreating={isCreating}
        isLoading={isLoading}
        workspaces={workspaces}
      />

      <section className="workspace-grid">
        <CreateWorkspaceForm
          error={error}
          isCreating={isCreating}
          onCreateWorkspace={createWorkspace}
        />
        <WorkspaceList
          isLoading={isLoading}
          onRefresh={loadWorkspaces}
          workspaces={workspaces}
        />
      </section>
    </main>
  );
}
