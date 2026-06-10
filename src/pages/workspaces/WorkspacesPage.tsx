import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { WorkspaceLauncherPage } from "@renderer/pages/workspaces/WorkspaceLauncherPage";
import { WorkspaceShellPage } from "@renderer/pages/workspaces/WorkspaceShellPage";
import { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import { appPaths } from "@renderer/shared/constants/appPaths";
import { Card } from "@renderer/shared/ui/Card";

export function WorkspacesPage() {
  const workspaceState = useWorkspaces();
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedWorkspaceId = workspaceState.selectedWorkspaceDetail?.workspace.id;
  const { loadWorkspaceDetail } = workspaceState;
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    if (selectedWorkspaceId === workspaceId) {
      return;
    }

    void loadWorkspaceDetail(workspaceId);
  }, [loadWorkspaceDetail, selectedWorkspaceId, workspaceId]);

  useEffect(() => {
    if (
      workspaceId ||
      workspaceState.isRestoringLastWorkspace ||
      isSwitchingWorkspace
    ) {
      return;
    }

    if (selectedWorkspaceId && location.pathname === appPaths.home()) {
      navigate(appPaths.workspaceOverview(selectedWorkspaceId), {
        replace: true,
      });
    }
  }, [
    location.pathname,
    navigate,
    workspaceId,
    workspaceState.isRestoringLastWorkspace,
    selectedWorkspaceId,
    isSwitchingWorkspace,
  ]);

  const launcherWorkspaceState = {
    ...workspaceState,
    createWorkspace: async (
      input: Parameters<typeof workspaceState.createWorkspace>[0],
    ) => {
      setIsSwitchingWorkspace(false);
      await workspaceState.createWorkspace(input);
    },
    openWorkspace: async (nextWorkspaceId: string) => {
      setIsSwitchingWorkspace(false);
      await workspaceState.openWorkspace(nextWorkspaceId);
      navigate(appPaths.workspaceOverview(nextWorkspaceId));
    },
  };

  const shellWorkspaceState = {
    ...workspaceState,
    closeWorkspace: () => {
      setIsSwitchingWorkspace(true);
      workspaceState.closeWorkspace();
      navigate(appPaths.home());
    },
  };

  if (workspaceState.isRestoringLastWorkspace) {
    return (
      <main className="grid min-h-screen place-items-center bg-theme-cream p-6">
        <Card className="w-full max-w-[460px] bg-white/60 p-7">
          <p className="mb-2 text-xs font-extrabold uppercase text-theme-plum">
            DataPrep Studio
          </p>
          <h1 className="text-3xl font-bold">Opening workspace...</h1>
          <p className="mt-2 text-sm text-theme-ink/68">
            Restoring your last local workspace.
          </p>
        </Card>
      </main>
    );
  }

  if (workspaceId && workspaceState.selectedWorkspaceDetail) {
    return <WorkspaceShellPage workspaceState={shellWorkspaceState} />;
  }

  if (workspaceId) {
    return (
      <main className="grid min-h-screen place-items-center bg-theme-cream p-6">
        <Card className="w-full max-w-[460px] bg-white/60 p-7">
          <p className="mb-2 text-xs font-extrabold uppercase text-theme-plum">
            DataPrep Studio
          </p>
          <h1 className="text-3xl font-bold">Opening workspace...</h1>
          <p className="mt-2 text-sm text-theme-ink/68">
            Loading workspace detail.
          </p>
        </Card>
      </main>
    );
  }

  return <WorkspaceLauncherPage workspaceState={launcherWorkspaceState} />;
}
