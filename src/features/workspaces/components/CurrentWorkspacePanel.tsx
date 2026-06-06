import type { WorkspaceDetail } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";

interface CurrentWorkspacePanelProps {
  detail: WorkspaceDetail | null;
}

export function CurrentWorkspacePanel({
  detail,
}: CurrentWorkspacePanelProps) {
  if (!detail) {
    return (
      <section className="current-workspace-panel empty-current-workspace">
        <div>
          <p className="eyebrow">Current workspace</p>
          <h2>No workspace selected</h2>
          <p className="muted">
            Select a workspace to inspect folders, manifest, status, and paths.
          </p>
        </div>
      </section>
    );
  }

  const { workspace, integrity } = detail;
  const healthyCount = integrity.filter((check) => check.exists).length;
  const missingChecks = integrity.filter((check) => !check.exists);

  return (
    <section className="workspace-health-panel">
      <div>
        <p className="eyebrow">Workspace health</p>
        <h2>{healthyCount === integrity.length ? "Ready" : "Needs attention"}</h2>
      </div>

      <div className="health-metrics">
        <div>
          <strong>
            {healthyCount}/{integrity.length}
          </strong>
          <span>checks passing</span>
        </div>
        <div>
          <strong>{workspace.status}</strong>
          <span>workspace status</span>
        </div>
        <div>
          <strong>{formatDateTime(workspace.updatedAt)}</strong>
          <span>last updated</span>
        </div>
      </div>

      {missingChecks.length > 0 ? (
        <div className="missing-checks">
          {missingChecks.map((check) => (
            <div className="integrity-card" key={check.key}>
              <span className="check-missing">Missing</span>
              <strong>{check.label}</strong>
              <code>{check.path}</code>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
