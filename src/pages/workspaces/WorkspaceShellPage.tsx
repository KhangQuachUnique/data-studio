import { DataSourcePanel } from "@renderer/features/data-sources/components/DataSourcePanel";
import { useDataSources } from "@renderer/features/data-sources/hooks/useDataSources";
import { CurrentWorkspacePanel } from "@renderer/features/workspaces/components/CurrentWorkspacePanel";
import type { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import type { WorkspaceDetail } from "@shared/types/Workspace";

type WorkspaceState = ReturnType<typeof useWorkspaces>;

interface WorkspaceShellPageProps {
  workspaceState: WorkspaceState;
}

export function WorkspaceShellPage({ workspaceState }: WorkspaceShellPageProps) {
  const { selectedWorkspaceDetail } = workspaceState;

  if (!selectedWorkspaceDetail) {
    return null;
  }

  return (
    <WorkspaceShellContent
      selectedWorkspaceDetail={selectedWorkspaceDetail}
      workspaceState={workspaceState}
    />
  );
}

interface WorkspaceShellContentProps {
  selectedWorkspaceDetail: WorkspaceDetail;
  workspaceState: WorkspaceState;
}

function WorkspaceShellContent({
  selectedWorkspaceDetail,
  workspaceState,
}: WorkspaceShellContentProps) {
  const {
    archiveWorkspace,
    closeWorkspace,
    openWorkspaceFolder,
    unarchiveWorkspace,
  } = workspaceState;

  const workspace = selectedWorkspaceDetail.workspace;
  const dataSourceState = useDataSources(workspace.id);
  const isArchived = workspace.status === "ARCHIVED";

  return (
    <main className="workbench-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="brand-mark">DP</span>
          <div>
            <strong>{workspace.name}</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Data Sources</button>
          <button className="nav-item" disabled>
            Tables
          </button>
          <button className="nav-item" disabled>
            Queries
          </button>
          <button className="nav-item" disabled>
            Exports
          </button>
          <button className="nav-item" disabled>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="secondary-button" onClick={closeWorkspace}>
            Switch workspace
          </button>
        </div>
      </aside>

      <section className="workspace-content">
        <header className="content-topbar">
          <div>
            <p className="eyebrow">Studio</p>
            <h1>{workspace.name}</h1>
            <p className="muted">{workspace.description ?? "No description"}</p>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">{workspace.status}</span>
            <button onClick={() => void openWorkspaceFolder(workspace.id)}>
              Open folder
            </button>
            {isArchived ? (
              <button
                className="secondary-button"
                onClick={() => void unarchiveWorkspace(workspace.id)}
              >
                Unarchive
              </button>
            ) : (
              <button
                className="secondary-button"
                onClick={() => void archiveWorkspace(workspace.id)}
              >
                Archive
              </button>
            )}
            <button className="secondary-button" onClick={closeWorkspace}>
              Switch workspace
            </button>
          </div>
        </header>

        <CurrentWorkspacePanel
          detail={selectedWorkspaceDetail}
        />

        <DataSourcePanel
          dataSourceState={dataSourceState}
          isReadOnly={isArchived}
        />
      </section>
    </main>
  );
}
