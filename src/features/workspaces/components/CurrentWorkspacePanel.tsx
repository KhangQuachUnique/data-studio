import type { WorkspaceDetail } from "@shared/types/Workspace";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";
import { Badge } from "@renderer/shared/ui/Badge";
import { Card } from "@renderer/shared/ui/Card";
import { EmptyState } from "@renderer/shared/ui/EmptyState";

interface CurrentWorkspacePanelProps {
  detail: WorkspaceDetail | null;
}

export function CurrentWorkspacePanel({
  detail,
}: CurrentWorkspacePanelProps) {
  if (!detail) {
    return (
      <EmptyState title="No workspace selected">
        Select a workspace to inspect folders, manifest, status, and paths.
      </EmptyState>
    );
  }

  const { workspace, integrity } = detail;
  const healthyCount = integrity.filter((check) => check.exists).length;
  const missingChecks = integrity.filter((check) => !check.exists);

  return (
    <Card as="section" className="grid gap-4 bg-white/58 p-5 lg:grid-cols-[260px_1fr]">
      <div>
        <p className="text-xs font-extrabold uppercase text-theme-plum">
          Workspace health
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          {healthyCount === integrity.length ? "Ready" : "Needs attention"}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-theme-sage p-4">
          <strong className="block text-2xl font-semibold">
            {healthyCount}/{integrity.length}
          </strong>
          <span className="text-xs font-extrabold uppercase text-theme-ink/68">
            checks passing
          </span>
        </div>
        <div className="rounded-lg bg-theme-lilac p-4">
          <strong className="block text-2xl font-semibold">
            {workspace.status}
          </strong>
          <span className="text-xs font-extrabold uppercase text-theme-ink/68">
            workspace status
          </span>
        </div>
        <div className="rounded-lg bg-theme-mist p-4">
          <strong className="block text-base font-semibold">
            {formatDateTime(workspace.updatedAt)}
          </strong>
          <span className="text-xs font-extrabold uppercase text-theme-ink/68">
            last updated
          </span>
        </div>
      </div>

      {missingChecks.length > 0 ? (
        <div className="grid gap-3 lg:col-span-2 md:grid-cols-3">
          {missingChecks.map((check) => (
            <div className="rounded-lg border border-theme-plum/10 bg-theme-blush/65 p-4" key={check.key}>
              <Badge tone="peach">Missing</Badge>
              <strong className="mt-3 block">{check.label}</strong>
              <code className="mt-2 block text-xs text-theme-ink/70">
                {check.path}
              </code>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
