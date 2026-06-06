import { CreateWorkspaceForm } from "@renderer/features/workspaces/components/CreateWorkspaceForm";
import { WorkspaceDiagnostics } from "@renderer/features/workspaces/components/WorkspaceDiagnostics";
import { WorkspaceList } from "@renderer/features/workspaces/components/WorkspaceList";
import type { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";

type WorkspaceState = ReturnType<typeof useWorkspaces>;

interface WorkspaceLauncherPageProps {
  workspaceState: WorkspaceState;
}

export function WorkspaceLauncherPage({
  workspaceState,
}: WorkspaceLauncherPageProps) {
  const {
    workspaces,
    selectedWorkspaceDetail,
    error,
    isCreating,
    isLoading,
    archiveWorkspace,
    createWorkspace,
    loadWorkspaces,
    openWorkspace,
    openWorkspaceFolder,
  } = workspaceState;

  return (
    <main className="launcher-shell">
      <header className="launcher-topbar">
        <div className="brand-block launcher-brand">
          <span className="brand-mark">DP</span>
          <div>
            <strong>DataPrep Studio</strong>
            <span>Local data preparation workbench</span>
          </div>
        </div>
        <span className="runtime-pill">
          {isLoading || isCreating ? "Syncing" : "Local ready"}
        </span>
      </header>

      <section className="launcher-hero">
        <div>
          <p className="eyebrow">Workspace launcher</p>
          <h1>Choose where your data work begins.</h1>
          <p className="summary">
            Create or open a local workspace. Each workspace keeps data files,
            metadata, queries, and exports isolated for one project.
          </p>
        </div>
      </section>

      <WorkspaceDiagnostics
        isCreating={isCreating}
        isLoading={isLoading}
        workspaces={workspaces}
      />

      <section className="launcher-grid">
        <CreateWorkspaceForm
          error={error}
          isCreating={isCreating}
          onCreateWorkspace={createWorkspace}
        />
        <WorkspaceList
          isLoading={isLoading}
          onArchiveWorkspace={archiveWorkspace}
          onOpenFolder={openWorkspaceFolder}
          onRefresh={loadWorkspaces}
          onSelectWorkspace={openWorkspace}
          selectedWorkspaceId={selectedWorkspaceDetail?.workspace.id}
          workspaces={workspaces}
        />
      </section>
    </main>
  );
}
