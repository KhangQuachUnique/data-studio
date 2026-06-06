import type { Workspace } from "@shared/types/Workspace";
import { WorkspaceListItem } from "./WorkspaceListItem";

interface WorkspaceListProps {
  isLoading: boolean;
  onArchiveWorkspace: (workspaceId: string) => Promise<void>;
  onOpenFolder: (workspaceId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  onUnarchiveWorkspace: (workspaceId: string) => Promise<void>;
  selectedWorkspaceId?: string;
  workspaces: Workspace[];
}

export function WorkspaceList({
  isLoading,
  onArchiveWorkspace,
  onOpenFolder,
  onRefresh,
  onSelectWorkspace,
  onUnarchiveWorkspace,
  selectedWorkspaceId,
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
          <WorkspaceListItem
            isSelected={workspace.id === selectedWorkspaceId}
            key={workspace.id}
            onArchiveWorkspace={onArchiveWorkspace}
            onOpenFolder={onOpenFolder}
            onSelectWorkspace={onSelectWorkspace}
            onUnarchiveWorkspace={onUnarchiveWorkspace}
            workspace={workspace}
          />
        ))}
      </ul>
    </div>
  );
}
