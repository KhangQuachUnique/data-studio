import { CurrentWorkspacePanel } from "@renderer/features/workspaces/components/CurrentWorkspacePanel";
import type { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";

type WorkspaceState = ReturnType<typeof useWorkspaces>;

interface WorkspaceShellPageProps {
  workspaceState: WorkspaceState;
}

export function WorkspaceShellPage({ workspaceState }: WorkspaceShellPageProps) {
  const {
    selectedWorkspaceDetail,
    archiveWorkspace,
    closeWorkspace,
    openWorkspaceFolder,
  } = workspaceState;

  if (!selectedWorkspaceDetail) {
    return null;
  }

  const workspace = selectedWorkspaceDetail.workspace;

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
          <button className="nav-item" disabled>
            Data Sources
          </button>
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
            <p className="eyebrow">Workspace overview</p>
            <h1>{workspace.name}</h1>
          </div>
          <div className="topbar-actions">
            <button onClick={() => void openWorkspaceFolder(workspace.id)}>
              Open folder
            </button>
            <button className="secondary-button" onClick={closeWorkspace}>
              Switch workspace
            </button>
          </div>
        </header>

        <CurrentWorkspacePanel
          detail={selectedWorkspaceDetail}
          onArchiveWorkspace={archiveWorkspace}
          onOpenFolder={openWorkspaceFolder}
        />

        <section className="quick-actions">
          <div>
            <p className="eyebrow">Next actions</p>
            <h2>Prepare this workspace</h2>
            <p className="muted">
              Data import, table profiling, query tools, and exports will attach
              to this selected workspace.
            </p>
          </div>
          <div className="quick-action-grid">
            <button disabled>Import CSV</button>
            <button className="secondary-button" disabled>
              New query
            </button>
            <button
              className="secondary-button"
              onClick={() => void openWorkspaceFolder(workspace.id)}
            >
              Open folder
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
