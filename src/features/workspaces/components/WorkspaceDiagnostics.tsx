import type { Workspace } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";

interface WorkspaceDiagnosticsProps {
  isCreating: boolean;
  isLoading: boolean;
  workspaces: Workspace[];
}

export function WorkspaceDiagnostics({
  isCreating,
  isLoading,
  workspaces,
}: WorkspaceDiagnosticsProps) {
  const activeCount = workspaces.filter(
    (workspace) => workspace.status === "ACTIVE",
  ).length;
  const archivedCount = workspaces.length - activeCount;
  const latestWorkspace = workspaces[0];

  return (
    <section className="diagnostics">
      <div className="metric-card">
        <span>Total workspaces</span>
        <strong>{workspaces.length}</strong>
        <p>SQLite records loaded through IPC.</p>
      </div>
      <div className="metric-card">
        <span>Active</span>
        <strong>{activeCount}</strong>
        <p>{archivedCount} archived.</p>
      </div>
      <div className="metric-card">
        <span>IPC status</span>
        <strong>{isLoading || isCreating ? "Busy" : "Ready"}</strong>
        <p>Preload bridge is responding.</p>
      </div>
      <div className="metric-card">
        <span>Latest workspace</span>
        <strong>{latestWorkspace?.name ?? "None"}</strong>
        <p>
          {latestWorkspace
            ? `Updated ${formatDateTime(latestWorkspace.updatedAt)}`
            : "Create one to validate the flow."}
        </p>
      </div>
    </section>
  );
}
