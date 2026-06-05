import type { Workspace } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";

interface WorkspaceListItemProps {
  workspace: Workspace;
}

export function WorkspaceListItem({ workspace }: WorkspaceListItemProps) {
  return (
    <li className="workspace-item">
      <div className="workspace-item-header">
        <div>
          <strong>{workspace.name}</strong>
          <span>{workspace.description ?? "No description"}</span>
        </div>
        <span className="status-pill">{workspace.status}</span>
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
