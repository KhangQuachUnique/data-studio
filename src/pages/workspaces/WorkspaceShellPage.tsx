import { Navigate, NavLink, useParams } from "react-router-dom";
import {
  FiArchive,
  FiBarChart2,
  FiDatabase,
  FiFolder,
  FiGrid,
  FiHome,
  FiLogOut,
  FiRefreshCcw,
  FiSettings,
  FiShare2,
} from "react-icons/fi";
import { DataSourcePanel } from "@renderer/features/data-sources/components/DataSourcePanel";
import { useDataSources } from "@renderer/features/data-sources/hooks/useDataSources";
import { CurrentWorkspacePanel } from "@renderer/features/workspaces/components/CurrentWorkspacePanel";
import type { DataSourceListItem } from "@shared/data-source/entities";
import { appPaths, isWorkspaceTab } from "@renderer/shared/constants/appPaths";
import type { useWorkspaces } from "@renderer/features/workspaces/hooks/useWorkspaces";
import type { WorkspaceDetail } from "@shared/workspace/entities";
import { cn } from "@renderer/shared/lib/cn";
import { Button } from "@renderer/shared/ui/Button";
import { Card } from "@renderer/shared/ui/Card";
import { EmptyState } from "@renderer/shared/ui/EmptyState";

type WorkspaceState = ReturnType<typeof useWorkspaces>;

interface WorkspaceShellPageProps {
  workspaceState: WorkspaceState;
}

export function WorkspaceShellPage({
  workspaceState,
}: WorkspaceShellPageProps) {
  const { selectedWorkspaceDetail } = workspaceState;

  if (!selectedWorkspaceDetail) {
    return null;
  }

  return (
    <WorkspaceShellContent
      selectedWorkspaceDetail={selectedWorkspaceDetail}
      workspaceState={workspaceState}
    />
  );
}

interface WorkspaceShellContentProps {
  selectedWorkspaceDetail: WorkspaceDetail;
  workspaceState: WorkspaceState;
}

function WorkspaceShellContent({
  selectedWorkspaceDetail,
  workspaceState,
}: WorkspaceShellContentProps) {
  const {
    archiveWorkspace,
    closeWorkspace,
    openWorkspaceFolder,
    unarchiveWorkspace,
  } = workspaceState;

  const workspace = selectedWorkspaceDetail.workspace;
  const dataSourceState = useDataSources(workspace.id);
  const isArchived = workspace.status === "ARCHIVED";
  const { workspaceTab } = useParams();
  const activeTab = isWorkspaceTab(workspaceTab) ? workspaceTab : null;

  if (!activeTab) {
    return <Navigate replace to={appPaths.workspaceOverview(workspace.id)} />;
  }

  return (
    <main className="grid min-h-screen bg-theme-cream p-3 text-theme-ink md:p-7">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] bg-white/48 shadow-dark-panel md:min-h-[calc(100vh-3.5rem)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-theme-plum/12 bg-theme-cream/85 lg:border-b-0 lg:border-r lg:border-theme-plum/12">
          <div className="flex items-center gap-3 border-b border-theme-plum/12 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-theme-plum text-base font-extrabold text-white">
              DP
            </span>
            <div className="min-w-0">
              <strong className="block max-w-[150px] truncate text-base">
                {workspace.name}
              </strong>
              <span className="text-xs font-medium text-theme-ink/65">
                Workspace
              </span>
            </div>
          </div>

          <nav
            aria-label="Workspace navigation"
            className="grid gap-1 p-3 sm:grid-cols-3 lg:grid-cols-1">
            <NavLink
              className={({ isActive }) => navItemClass(isActive)}
              to={appPaths.workspaceOverview(workspace.id)}>
              <FiHome aria-hidden="true" />
              Overview
            </NavLink>
            <NavLink
              className={({ isActive }) => navItemClass(isActive)}
              to={appPaths.workspaceDataSources(workspace.id)}>
              <FiDatabase aria-hidden="true" />
              Data Sources
            </NavLink>
            <button className={navItemClass(false)} disabled>
              <FiGrid aria-hidden="true" />
              Tables
            </button>
            <button className={navItemClass(false)} disabled>
              <FiBarChart2 aria-hidden="true" />
              Queries
            </button>
            <button className={navItemClass(false)} disabled>
              <FiShare2 aria-hidden="true" />
              Exports
            </button>
            <button className={navItemClass(false)} disabled>
              <FiSettings aria-hidden="true" />
              Settings
            </button>
          </nav>

          <div className="mt-auto p-4">
            <Button
              className="w-full rounded-lg py-4 text-md"
              onClick={closeWorkspace}
              variant="primary">
              <FiLogOut aria-hidden="true" />
              Switch workspace
            </Button>
          </div>
        </aside>

        <section className="min-w-0 p-4 md:p-6">
          <header className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase text-theme-plum">
                Studio
              </p>
              <h1 className="mt-2 max-w-[760px] text-4xl font-semibold leading-none md:text-6xl">
                {workspace.name}
              </h1>
              <p className="mt-3 max-w-[680px] text-sm text-theme-ink/68">
                {workspace.description ?? "No description"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button
                onClick={() => void openWorkspaceFolder(workspace.id)}
                variant="secondary">
                <FiFolder aria-hidden="true" />
                Open folder
              </Button>
              {isArchived ? (
                <Button
                  onClick={() => void unarchiveWorkspace(workspace.id)}
                  variant="secondary">
                  <FiRefreshCcw aria-hidden="true" />
                  Unarchive
                </Button>
              ) : (
                <Button
                  onClick={() => void archiveWorkspace(workspace.id)}
                  variant="secondary">
                  <FiArchive aria-hidden="true" />
                  Archive
                </Button>
              )}
              <Button onClick={closeWorkspace} variant="secondary">
                <FiLogOut aria-hidden="true" />
                Switch workspace
              </Button>
            </div>
          </header>

          {activeTab === "overview" ? (
            <WorkspaceOverview
              dataSources={dataSourceState.dataSources}
              detail={selectedWorkspaceDetail}
              isLoadingDataSources={dataSourceState.isLoading}
            />
          ) : (
            <DataSourcePanel
              dataSourceState={dataSourceState}
              isReadOnly={isArchived}
            />
          )}
        </section>
      </div>
    </main>
  );
}

interface WorkspaceOverviewProps {
  detail: WorkspaceDetail;
  dataSources: DataSourceListItem[];
  isLoadingDataSources: boolean;
}

function WorkspaceOverview({
  detail,
  dataSources,
  isLoadingDataSources,
}: WorkspaceOverviewProps) {
  const totalRows = dataSources.reduce(
    (sum, item) => sum + (item.currentVersion?.rowCount ?? 0),
    0,
  );
  const totalColumns = dataSources.reduce(
    (sum, item) => sum + (item.currentVersion?.columnCount ?? 0),
    0,
  );
  const latestDataSource = dataSources[0];

  return (
    <div className="grid gap-4">
      <CurrentWorkspacePanel detail={detail} />

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard
          label="Datasets"
          tone="bg-theme-lilac"
          value={dataSources.length}
        />
        <MetricCard
          label="Total rows"
          tone="bg-theme-blush"
          value={totalRows.toLocaleString()}
        />
        <MetricCard
          label="Total columns"
          tone="bg-theme-sage"
          value={totalColumns.toLocaleString()}
        />
        <MetricCard
          label="Latest import"
          tone="bg-theme-mist"
          value={latestDataSource?.dataSource.name ?? "None"}
        />
      </section>

      <Card
        as="section"
        className="grid gap-4 bg-theme-cream p-5 text-theme-ink">
        <div>
          <p className="text-xs font-extrabold uppercase text-theme-plum">
            Overview
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Data sources</h2>
        </div>

        {isLoadingDataSources ? (
          <p className="text-sm font-medium text-theme-ink/68">
            Loading data sources...
          </p>
        ) : null}

        {!isLoadingDataSources && dataSources.length === 0 ? (
          <EmptyState title="No data sources yet">
            Import a CSV file from the Data Sources tab.
          </EmptyState>
        ) : null}
      </Card>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  tone: string;
  value: string | number;
}

function MetricCard({ label, tone, value }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg p-5 text-theme-ink", tone)}>
      <span className="text-xs font-extrabold uppercase text-theme-ink/68">
        {label}
      </span>
      <strong className="mt-4 block truncate text-3xl font-semibold">
        {value}
      </strong>
    </div>
  );
}

function navItemClass(isActive: boolean): string {
  return cn(
    "inline-flex min-h-10 items-center justify-start gap-3 rounded-lg px-4 py-1 text-md font-bold text-theme-ink/68 transition duration-100 hover:bg-theme-lilac/40 hover:text-theme-ink disabled:hover:bg-transparent disabled:hover:text-theme-ink/45",
    isActive && "bg-theme-plum text-white hover:bg-theme-plum hover:text-white",
  );
}
