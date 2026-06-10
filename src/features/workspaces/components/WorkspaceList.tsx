import { FiPlus, FiRefreshCw } from "react-icons/fi";
import type { Workspace } from "@shared/types/Workspace";
import { Button } from "@renderer/shared/ui/Button";
import { Card } from "@renderer/shared/ui/Card";
import { WorkspaceListItem } from "./WorkspaceListItem";

interface WorkspaceListProps {
  isLoading: boolean;
  onArchiveWorkspace: (workspaceId: string) => Promise<void>;
  onCreateWorkspace: () => void;
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
  onCreateWorkspace,
  onOpenFolder,
  onRefresh,
  onSelectWorkspace,
  onUnarchiveWorkspace,
  selectedWorkspaceId,
  workspaces,
}: WorkspaceListProps) {
  return (
    <Card className="flex flex-col gap-3 bg-white/55 p-4 h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Workspaces</h2>
          <p className="text-sm text-theme-ink/68">
            {workspaces.length} available
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreateWorkspace}>
            <FiPlus aria-hidden="true" />
            New workspace
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => void onRefresh()}
            variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm font-medium text-theme-ink/68">
          Loading workspaces...
        </p>
      ) : null}

      <ul className="grid gap-2">
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
    </Card>
  );
}
