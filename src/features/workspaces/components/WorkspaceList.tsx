import type { Workspace } from "@shared/types/Workspace";
import { WorkspaceListItem } from "./WorkspaceListItem";

interface WorkspaceListProps {
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  workspaces: Workspace[];
}

export function WorkspaceList({
  isLoading,
  onRefresh,
  workspaces,
}: WorkspaceListProps) {
  return (
    <div className="workspace-list">
      <div className="list-header">
        <div>
          <h2>Workspace records</h2>
          <p className="muted">Metadata returned by `workspace:list`.</p>
        </div>
        <button disabled={isLoading} onClick={() => void onRefresh()}>
          Refresh
        </button>
      </div>

      {isLoading ? <p className="muted">Loading workspaces...</p> : null}

      {!isLoading && workspaces.length === 0 ? (
        <div className="empty-state">
          <strong>No workspaces yet</strong>
          <p>Create one to test folder creation, SQLite insert, and list refresh.</p>
        </div>
      ) : null}

      <ul>
        {workspaces.map((workspace) => (
          <WorkspaceListItem key={workspace.id} workspace={workspace} />
        ))}
      </ul>
    </div>
  );
}
