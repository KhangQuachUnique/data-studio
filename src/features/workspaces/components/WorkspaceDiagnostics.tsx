import type { Workspace } from "@shared/workspace/entities";
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
        <span>Workspaces</span>
        <strong>{workspaces.length}</strong>
        <p>Total records.</p>
      </div>
      <div className="metric-card">
        <span>Active</span>
        <strong>{activeCount}</strong>
        <p>{archivedCount} archived.</p>
      </div>
      <div className="metric-card">
        <span>Status</span>
        <strong>{isLoading || isCreating ? "Busy" : "Ready"}</strong>
        <p>Local app bridge.</p>
      </div>
      <div className="metric-card">
        <span>Latest</span>
        <strong>{latestWorkspace?.name ?? "None"}</strong>
        <p>
          {latestWorkspace
            ? `Updated ${formatDateTime(latestWorkspace.updatedAt)}`
            : "No workspace yet."}
        </p>
      </div>
    </section>
  );
}
