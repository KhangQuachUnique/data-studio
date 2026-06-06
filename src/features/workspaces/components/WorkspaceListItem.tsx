import type { Workspace } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";

interface WorkspaceListItemProps {
  isSelected: boolean;
  onArchiveWorkspace: (workspaceId: string) => Promise<void>;
  onOpenFolder: (workspaceId: string) => Promise<void>;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  onUnarchiveWorkspace: (workspaceId: string) => Promise<void>;
  workspace: Workspace;
}

export function WorkspaceListItem({
  isSelected,
  onArchiveWorkspace,
  onOpenFolder,
  onSelectWorkspace,
  onUnarchiveWorkspace,
  workspace,
}: WorkspaceListItemProps) {
  return (
    <li className={isSelected ? "workspace-item selected" : "workspace-item"}>
      <div className="workspace-item-header">
        <div>
          <strong>{workspace.name}</strong>
          <span>{workspace.description ?? "No description"}</span>
        </div>
        <span className="status-pill">{workspace.status}</span>
      </div>

      <div className="workspace-actions">
        <button onClick={() => void onSelectWorkspace(workspace.id)}>
          {isSelected ? "Selected" : "Select"}
        </button>
        <button onClick={() => void onOpenFolder(workspace.id)}>
          Open folder
        </button>
        {workspace.status === "ARCHIVED" ? (
          <button
            className="secondary-button"
            onClick={() => void onUnarchiveWorkspace(workspace.id)}
          >
            Unarchive
          </button>
        ) : (
          <button
            className="secondary-button"
            onClick={() => void onArchiveWorkspace(workspace.id)}
          >
            Archive
          </button>
        )}
      </div>

      <dl className="workspace-detail-grid">
        <div>
          <dt>Slug</dt>
          <dd>{workspace.slug}</dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd>{workspace.id}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(workspace.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(workspace.updatedAt)}</dd>
        </div>
      </dl>

      <div className="path-block">
        <span>Workspace folder</span>
        <code>{workspace.path}</code>
      </div>
      <div className="path-block">
        <span>DuckDB file</span>
        <code>{workspace.duckdbPath}</code>
      </div>
    </li>
  );
}
