import { WorkspaceLauncherPage } from "@renderer/pages/workspaces/WorkspaceLauncherPage";
import { WorkspaceShellPage } from "@renderer/pages/workspaces/WorkspaceShellPage";
import { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import "@renderer/features/workspaces/styles/workspaces.css";

export function WorkspacesPage() {
  const workspaceState = useWorkspaces();

  if (workspaceState.isRestoringLastWorkspace) {
    return (
      <main className="loading-shell">
        <div className="loading-panel">
          <p className="eyebrow">DataPrep Studio</p>
          <h1>Opening workspace...</h1>
          <p className="muted">Restoring your last local workspace.</p>
        </div>
      </main>
    );
  }

  if (workspaceState.selectedWorkspaceDetail) {
    return <WorkspaceShellPage workspaceState={workspaceState} />;
  }

  return <WorkspaceLauncherPage workspaceState={workspaceState} />;
}
