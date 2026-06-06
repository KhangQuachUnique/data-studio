import type { WorkspaceDetail } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";

interface CurrentWorkspacePanelProps {
  detail: WorkspaceDetail | null;
  onArchiveWorkspace: (workspaceId: string) => Promise<void>;
  onOpenFolder: (workspaceId: string) => Promise<void>;
}

export function CurrentWorkspacePanel({
  detail,
  onArchiveWorkspace,
  onOpenFolder,
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

  return (
    <section className="current-workspace-panel">
      <div className="current-workspace-header">
        <div>
          <p className="eyebrow">Current workspace</p>
          <h2>{workspace.name}</h2>
          <p className="muted">
            {workspace.description ?? "No description"} | Updated{" "}
            {formatDateTime(workspace.updatedAt)}
          </p>
        </div>
        <div className="panel-actions">
          <button onClick={() => void onOpenFolder(workspace.id)}>
            Open folder
          </button>
          <button
            className="secondary-button"
            disabled={workspace.status === "ARCHIVED"}
            onClick={() => void onArchiveWorkspace(workspace.id)}
          >
            {workspace.status === "ARCHIVED" ? "Archived" : "Archive"}
          </button>
        </div>
      </div>

      <div className="integrity-summary">
        <strong>
          {healthyCount}/{integrity.length}
        </strong>
        <span>workspace checks passing</span>
      </div>

      <div className="integrity-grid">
        {integrity.map((check) => (
          <div className="integrity-card" key={check.key}>
            <span className={check.exists ? "check-ok" : "check-missing"}>
              {check.exists ? "OK" : "Missing"}
            </span>
            <strong>{check.label}</strong>
            <code>{check.path}</code>
          </div>
        ))}
      </div>
    </section>
  );
}
