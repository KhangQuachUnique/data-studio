import { FormEvent, useState } from "react";
import { FiCpu } from "react-icons/fi";
import { WorkspaceList } from "@renderer/features/workspaces/components/WorkspaceList";
import type { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import { Button } from "@renderer/shared/ui/Button";
import { Card } from "@renderer/shared/ui/Card";
import { Dialog } from "@renderer/shared/ui/Dialog";
import { EmptyState } from "@renderer/shared/ui/EmptyState";
import { Field, Input, Textarea } from "@renderer/shared/ui/Field";

type WorkspaceState = ReturnType<typeof useWorkspaces>;

interface WorkspaceLauncherPageProps {
  workspaceState: WorkspaceState;
}

export function WorkspaceLauncherPage({
  workspaceState,
}: WorkspaceLauncherPageProps) {
  const {
    workspaces,
    selectedWorkspaceDetail,
    error,
    isCreating,
    isLoading,
    archiveWorkspace,
    createWorkspace,
    loadWorkspaces,
    openWorkspace,
    openWorkspaceFolder,
    unarchiveWorkspace,
  } = workspaceState;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleCreateWorkspace(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!workspaceName.trim()) {
      setValidationError("Workspace name is required.");
      return;
    }

    setValidationError(null);

    await createWorkspace({
      description: workspaceDescription.trim() || undefined,
      name: workspaceName,
    });

    setWorkspaceName("");
    setWorkspaceDescription("");
    setIsCreateDialogOpen(false);
  }

  function closeCreateDialog(): void {
    setValidationError(null);
    setIsCreateDialogOpen(false);
  }

  return (
    <main className="min-h-screen bg-theme-cream p-4 text-theme-ink sm:p-7">
      <div className="mx-auto grid max-w-[1220px] gap-4">
        <header className="grid gap-4 rounded-[2rem] border border-theme-plum/10 bg-white/58 p-5 shadow-soft-panel md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-theme-plum text-lg font-extrabold text-white">
              DP
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-theme-plum">
                <FiCpu aria-hidden="true" />
                Local data studio
              </p>
              <h1 className="max-w-[720px] text-[2.7rem] font-semibold leading-[1.02] tracking-normal sm:text-[4rem]">
                Choose a workspace
              </h1>
              <p className="mt-3 max-w-[620px] text-base text-theme-ink/68">
                Open an existing workspace or create a new isolated home for a
                data project.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <WorkspaceList
            isLoading={isLoading}
            onArchiveWorkspace={archiveWorkspace}
            onCreateWorkspace={() => setIsCreateDialogOpen(true)}
            onOpenFolder={openWorkspaceFolder}
            onRefresh={loadWorkspaces}
            onSelectWorkspace={openWorkspace}
            onUnarchiveWorkspace={unarchiveWorkspace}
            selectedWorkspaceId={selectedWorkspaceDetail?.workspace.id}
            workspaces={workspaces}
          />

          <Card className="h-fit bg-white/55 p-5 text-theme-ink shadow-soft-panel">
            <p className="text-xs font-extrabold uppercase text-theme-plum">
              Project layers
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Clean boundaries</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["Sources", "Raw files and imported table previews."],
                ["Workspace", "Manifest, local storage, and health checks."],
                ["Outputs", "Queries and exports stay scoped per project."],
              ].map(([title, description], index) => (
                <div
                  className="rounded-lg border border-theme-plum/10 bg-theme-cream/70 p-4"
                  key={title}>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-theme-lilac text-sm font-extrabold text-theme-ink">
                    {index + 1}
                  </span>
                  <strong className="mt-3 block">{title}</strong>
                  <p className="mt-1 text-sm text-theme-ink/68">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {!isLoading && workspaces.length === 0 ? (
          <EmptyState className="bg-white/55" title="No workspaces yet">
            Create one and the list will appear here.
          </EmptyState>
        ) : null}
      </div>

      {isCreateDialogOpen ? (
        <Dialog
          description="Set up local storage for a project."
          onClose={closeCreateDialog}
          onSubmit={handleCreateWorkspace}
          title="Create workspace">
          <Field label="Name">
            <Input
              autoFocus
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Customer cleanup"
              value={workspaceName}
            />
          </Field>

          <Field label="Description">
            <Textarea
              onChange={(event) => setWorkspaceDescription(event.target.value)}
              placeholder="Optional"
              rows={3}
              value={workspaceDescription}
            />
          </Field>

          {validationError ? (
            <p className="text-sm font-semibold text-[#9F4959]">
              {validationError}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm font-semibold text-[#9F4959]">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button onClick={closeCreateDialog} variant="secondary">
              Cancel
            </Button>
            <Button disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </Dialog>
      ) : null}
    </main>
  );
}
