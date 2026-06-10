import { FiArchive, FiFolder, FiRotateCcw } from "react-icons/fi";
import type { Workspace } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";
import { Button } from "@renderer/shared/ui/Button";
import { cn } from "@renderer/shared/lib/cn";

interface WorkspaceListItemProps {
  isSelected: boolean;
  onArchiveWorkspace: (workspaceId: string) => Promise<void>;
  onOpenFolder: (workspaceId: string) => Promise<void>;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  onUnarchiveWorkspace: (workspaceId: string) => Promise<void>;
  workspace: Workspace;
}

export function WorkspaceListItem({
  onArchiveWorkspace,
  onOpenFolder,
  onSelectWorkspace,
  onUnarchiveWorkspace,
  workspace,
}: WorkspaceListItemProps) {
  return (
    <li
      className={cn(
        "flex h-fit items-center gap-1.5 rounded-lg border bg-white/72 p-2 transition",
        "border-theme-plum/10 hover:border-theme-plum/25",
      )}>
      <button
        className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-md px-2 py-1 text-left transition hover:bg-theme-lilac/24 focus:outline-none focus:ring-2 focus:ring-theme-plum/20"
        onClick={() => void onSelectWorkspace(workspace.id)}
        type="button">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-lg bg-theme-lilac/50 text-theme-ink">
          <FiFolder />
        </span>

        <span className="grid min-w-0 gap-0.5">
          <span className="grid min-w-0 items-baseline gap-x-8 gap-y-0.5 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <strong className="min-w-0 truncate text-[1.1rem] font-semibold">
              {workspace.name}
            </strong>
            <span className="whitespace-nowrap text-[0.85rem] font-semibold text-theme-ink/60">
              Created {formatDateTime(workspace.createdAt)}
            </span>
            <span className="whitespace-nowrap text-[0.85rem] font-semibold text-theme-ink/60">
              Updated {formatDateTime(workspace.updatedAt)}
            </span>
          </span>
          <span className="truncate text-[0.8rem] leading-4 text-theme-ink/68">
            {workspace.description ?? "No description"}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label={`Open ${workspace.name} folder`}
          className="h-10 w-10 rounded-md"
          onClick={() => void onOpenFolder(workspace.id)}
          size="icon"
          title="Open folder"
          variant="secondary">
          <FiFolder aria-hidden="true" />
        </Button>
        {workspace.status === "ARCHIVED" ? (
          <Button
            aria-label={`Unarchive ${workspace.name}`}
            className="h-10 w-10 rounded-md"
            onClick={() => void onUnarchiveWorkspace(workspace.id)}
            size="icon"
            title="Unarchive"
            variant="secondary">
            <FiRotateCcw aria-hidden="true" />
          </Button>
        ) : (
          <Button
            aria-label={`Archive ${workspace.name}`}
            className="h-10 w-10 rounded-md"
            onClick={() => void onArchiveWorkspace(workspace.id)}
            size="icon"
            title="Archive"
            variant="secondary">
            <FiArchive aria-hidden="true" />
          </Button>
        )}
      </div>
    </li>
  );
}
