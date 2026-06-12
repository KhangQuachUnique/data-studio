import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiEye,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { formatDateTime } from "@renderer/shared/lib/formatDateTime";
import { Badge } from "@renderer/shared/ui/Badge";
import { Button } from "@renderer/shared/ui/Button";
import { Card } from "@renderer/shared/ui/Card";
import { EmptyState } from "@renderer/shared/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@renderer/shared/ui/Table";
import type {
  DataSource,
  DataSourceListItem,
} from "@shared/data-source/entities";
import type { DatasetVersion } from "@shared/dataset-version/entities";
import type { ColumnProfileReport } from "@shared/profile/entities";
import type { useDataSources } from "../hooks/useDataSources";

type DataSourceState = ReturnType<typeof useDataSources>;
type PreviewState = DataSourceState["previews"][string];
type ProfileState = DataSourceState["profiles"][string];

interface DataSourcePanelProps {
  dataSourceState: DataSourceState;
  isReadOnly?: boolean;
}

export function DataSourcePanel({
  dataSourceState,
  isReadOnly = false,
}: DataSourcePanelProps) {
  const {
    dataSources,
    deleteDataSource,
    deletingIds,
    error,
    importCsv,
    isImporting,
    isLoading,
    loadDataSources,
    loadProfile,
    loadPreview,
    profiles,
    previews,
    runProfile,
  } = dataSourceState;
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<
    string | null
  >(null);
  const selectedItem = useMemo(
    () =>
      dataSources.find(
        (item) => item.dataSource.id === selectedDataSourceId,
      ) ?? null,
    [dataSources, selectedDataSourceId],
  );

  useEffect(() => {
    if (
      selectedDataSourceId &&
      !dataSources.some((item) => item.dataSource.id === selectedDataSourceId)
    ) {
      setSelectedDataSourceId(null);
    }
  }, [dataSources, selectedDataSourceId]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const dataSourceId = selectedItem.dataSource.id;
    const previewState = previews[dataSourceId];

    if (!previewState?.preview && !previewState?.isLoading && !previewState?.error) {
      void loadPreview(dataSourceId);
    }
  }, [loadPreview, previews, selectedItem]);

  return (
    <Card as="section" className="grid gap-4 bg-white/58 p-5 text-theme-ink">
      {selectedItem ? (
        <DataSourceDetailView
          deleteDataSource={deleteDataSource}
          deletingIds={deletingIds}
          isReadOnly={isReadOnly}
          item={selectedItem}
          loadProfile={loadProfile}
          loadPreview={loadPreview}
          onBack={() => setSelectedDataSourceId(null)}
          profileState={
            selectedItem.currentVersion
              ? profiles[selectedItem.currentVersion.id]
              : undefined
          }
          previewState={previews[selectedItem.dataSource.id]}
          runProfile={runProfile}
        />
      ) : (
        <DataSourceTableView
          dataSources={dataSources}
          error={error}
          importCsv={importCsv}
          isImporting={isImporting}
          isLoading={isLoading}
          isReadOnly={isReadOnly}
          loadDataSources={loadDataSources}
          onSelectDataSource={setSelectedDataSourceId}
        />
      )}
    </Card>
  );
}

interface DataSourceTableViewProps {
  dataSources: DataSourceListItem[];
  error: string | null;
  importCsv: () => Promise<void>;
  isImporting: boolean;
  isLoading: boolean;
  isReadOnly: boolean;
  loadDataSources: () => Promise<void>;
  onSelectDataSource: (dataSourceId: string) => void;
}

function DataSourceTableView({
  dataSources,
  error,
  importCsv,
  isImporting,
  isLoading,
  isReadOnly,
  loadDataSources,
  onSelectDataSource,
}: DataSourceTableViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase text-theme-plum">
            Data sources
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Current datasets</h2>
          <p className="mt-1 text-sm text-theme-ink/68">
            Each row opens the current dataset version for that source.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void loadDataSources()} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Refresh
          </Button>
          <Button
            disabled={isImporting || isReadOnly}
            onClick={() => void importCsv()}
          >
            <FiUpload aria-hidden="true" />
            {isReadOnly
              ? "Archived"
              : isImporting
                ? "Importing..."
                : "Import CSV"}
          </Button>
        </div>
      </div>

      {isReadOnly ? (
        <p className="rounded-lg bg-theme-butter p-3 text-sm font-medium text-theme-ink/75">
          This workspace is archived, so data sources are view-only.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm font-semibold text-[#9F4959]">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="text-sm font-medium text-theme-ink/68">
          Loading data sources...
        </p>
      ) : null}

      {!isLoading && dataSources.length === 0 ? (
        <EmptyState title="No data sources yet">
          Import a CSV file to create the first dataset version.
        </EmptyState>
      ) : null}

      {dataSources.length > 0 ? (
        <DataSourceTable
          dataSources={dataSources}
          onSelectDataSource={onSelectDataSource}
        />
      ) : null}
    </>
  );
}

interface DataSourceTableProps {
  dataSources: DataSourceListItem[];
  onSelectDataSource: (dataSourceId: string) => void;
}

function DataSourceTable({
  dataSources,
  onSelectDataSource,
}: DataSourceTableProps) {
  return (
    <TableContainer>
      <Table className="min-w-[860px] table-fixed">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Current version</TableHeaderCell>
            <TableHeaderCell>Rows</TableHeaderCell>
            <TableHeaderCell>Columns</TableHeaderCell>
            <TableHeaderCell>Updated</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSources.map((item) => {
            const { dataSource, currentVersion, dataset } = item;

            return (
              <TableRow
                className="cursor-pointer transition hover:bg-theme-lilac/18"
                key={dataSource.id}
                onClick={() => onSelectDataSource(dataSource.id)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectDataSource(dataSource.id);
                  }
                }}
              >
                <TableCell>
                  <strong className="block truncate font-semibold">
                    {dataSource.name}
                  </strong>
                  <small className="block truncate text-xs font-medium text-theme-ink/62">
                    {dataSource.sourceUri ?? "Local import"}
                  </small>
                </TableCell>
                <TableCell>{dataSource.sourceType}</TableCell>
                <TableCell>
                  <Badge tone={dataset?.status === "active" ? "mint" : "peach"}>
                    {dataset?.status ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {currentVersion ? `v${currentVersion.versionNumber}` : "None"}
                </TableCell>
                <TableCell>
                  {currentVersion?.rowCount?.toLocaleString() ?? "Unknown"}
                </TableCell>
                <TableCell>{currentVersion?.columnCount ?? "Unknown"}</TableCell>
                <TableCell>
                  {formatDateTime(currentVersion?.createdAt ?? dataSource.updatedAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface DataSourceDetailViewProps {
  deleteDataSource: (dataSourceId: string) => Promise<void>;
  deletingIds: string[];
  isReadOnly: boolean;
  item: DataSourceListItem;
  loadProfile: (datasetVersionId: string) => Promise<void>;
  loadPreview: (dataSourceId: string) => Promise<void>;
  onBack: () => void;
  profileState?: ProfileState;
  previewState?: PreviewState;
  runProfile: (datasetVersionId: string) => Promise<void>;
}

function DataSourceDetailView({
  deleteDataSource,
  deletingIds,
  isReadOnly,
  item,
  loadProfile,
  loadPreview,
  onBack,
  profileState,
  previewState,
  runProfile,
}: DataSourceDetailViewProps) {
  const { dataSource, currentVersion, dataset } = item;

  useEffect(() => {
    if (!currentVersion) {
      return;
    }

    if (!profileState?.hasLoaded && !profileState?.isLoading) {
      void loadProfile(currentVersion.id);
    }
  }, [currentVersion, loadProfile, profileState]);

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Button className="mb-3" onClick={onBack} size="sm" variant="ghost">
            <FiArrowLeft aria-hidden="true" />
            Back
          </Button>
          <p className="text-xs font-extrabold uppercase text-theme-plum">
            Data source detail
          </p>
          <h2 className="mt-1 truncate text-2xl font-semibold">
            {dataSource.name}
          </h2>
          <p className="mt-1 text-sm text-theme-ink/68">
            {dataSource.sourceType} source using current dataset{" "}
            {currentVersion ? `v${currentVersion.versionNumber}` : "version"}.
          </p>
        </div>
        <Button
          disabled={isReadOnly || deletingIds.includes(dataSource.id)}
          onClick={() => {
            if (confirm(`Delete data source "${dataSource.name}"?`)) {
              void deleteDataSource(dataSource.id);
            }
          }}
          variant="danger"
        >
          <FiTrash2 aria-hidden="true" />
          {deletingIds.includes(dataSource.id) ? "Deleting..." : "Delete"}
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <MetadataPanel
          items={getSourceMetadata(dataSource)}
          title="Source metadata"
        />
        <MetadataPanel
          items={getCurrentVersionMetadata(
            currentVersion,
            item.versionCount,
            dataset?.displayName ?? dataset?.name,
          )}
          title="Current dataset version"
        />
      </section>

      <VersionsBlock currentVersion={currentVersion} versionCount={item.versionCount} />

      <DatasetProfileBlock
        currentVersion={currentVersion}
        isReadOnly={isReadOnly}
        loadProfile={loadProfile}
        profileState={profileState}
        runProfile={runProfile}
      />

      <DataSourcePreviewBlock
        dataSourceId={dataSource.id}
        loadPreview={loadPreview}
        previewState={previewState}
      />
    </div>
  );
}

interface DatasetProfileBlockProps {
  currentVersion?: DatasetVersion;
  isReadOnly: boolean;
  loadProfile: (datasetVersionId: string) => Promise<void>;
  profileState?: ProfileState;
  runProfile: (datasetVersionId: string) => Promise<void>;
}

function DatasetProfileBlock({
  currentVersion,
  isReadOnly,
  loadProfile,
  profileState,
  runProfile,
}: DatasetProfileBlockProps) {
  const detail = profileState?.detail;
  const report = detail?.profileReport;
  const columnReports = detail?.columnReports ?? [];
  const isBusy = Boolean(profileState?.isLoading || profileState?.isRunning);
  const qualityIssues = readJsonArray<ProfileIssue>(report?.qualityIssuesJson);
  const suggestedActions = readJsonArray<ProfileAction>(
    report?.suggestedActionsJson,
  );

  return (
    <section className="grid gap-4 rounded-lg border border-theme-plum/10 bg-white/55 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[0.7rem] font-extrabold uppercase text-theme-ink/68">
            Profile
          </span>
          <strong className="block text-base">Dataset quality</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!currentVersion || profileState?.isLoading}
            onClick={() => currentVersion && void loadProfile(currentVersion.id)}
            variant="secondary"
          >
            <FiRefreshCw aria-hidden="true" />
            {profileState?.isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button
            disabled={!currentVersion || isReadOnly || isBusy}
            onClick={() => currentVersion && void runProfile(currentVersion.id)}
          >
            {profileState?.isRunning ? (
              <FiRefreshCw aria-hidden="true" />
            ) : (
              <FiPlay aria-hidden="true" />
            )}
            {isReadOnly
              ? "Archived"
              : profileState?.isRunning
                ? "Profiling..."
                : report
                  ? "Run again"
                  : "Run profile"}
          </Button>
        </div>
      </div>

      {!currentVersion ? (
        <EmptyState title="No dataset version">
          Import data before running a profile.
        </EmptyState>
      ) : null}

      {profileState?.error ? (
        <p className="text-sm font-semibold text-[#9F4959]">
          {profileState.error}
        </p>
      ) : null}

      {!report && currentVersion && profileState?.hasLoaded ? (
        <EmptyState title="No profile yet">
          Run a profile to inspect missing values, duplicates, and quality signals.
        </EmptyState>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <ProfileMetric
              label="Quality score"
              tone={getQualityTone(report.qualityScore)}
              value={
                report.qualityScore === undefined
                  ? "Unknown"
                  : `${report.qualityScore}/100`
              }
            />
            <ProfileMetric
              label="Missing cells"
              value={formatRatioWithCount(
                report.missingCellCount,
                report.missingCellRatio,
              )}
            />
            <ProfileMetric
              label="Duplicate rows"
              value={formatRatioWithCount(
                report.duplicateRowCount,
                report.duplicateRowRatio,
              )}
            />
            <ProfileMetric
              label="Empty rows"
              value={formatRatioWithCount(
                report.emptyRowCount,
                report.emptyRowRatio,
              )}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ProfileList
              emptyText="No quality issues found."
              items={qualityIssues.map((issue, index) => ({
                badge: issue.severity ?? "info",
                key: issue.code ?? issue.message ?? `quality_issue_${index}`,
                text: issue.message ?? "Review this quality issue.",
              }))}
              title="Quality issues"
            />
            <ProfileList
              emptyText="No suggested actions."
              items={suggestedActions.map((action, index) => ({
                badge: action.code,
                key: action.code ?? action.message ?? `suggested_action_${index}`,
                text: action.message ?? "Review this action.",
              }))}
              title="Suggested actions"
            />
          </div>

          <ColumnProfileTable columnReports={columnReports} />
        </>
      ) : null}
    </section>
  );
}

interface ProfileMetricProps {
  label: string;
  tone?: "mint" | "peach" | "lavender";
  value: string;
}

function ProfileMetric({ label, tone = "lavender", value }: ProfileMetricProps) {
  const toneClass = {
    lavender: "bg-theme-lilac/55",
    mint: "bg-theme-sage",
    peach: "bg-theme-butter",
  }[tone];

  return (
    <div className={`${toneClass} rounded-lg p-3`}>
      <span className="text-[0.7rem] font-extrabold uppercase text-theme-ink/68">
        {label}
      </span>
      <strong className="mt-2 block text-xl font-semibold">{value}</strong>
    </div>
  );
}

interface ProfileListProps {
  emptyText: string;
  items: Array<{ badge?: string; key: string; text?: string }>;
  title: string;
}

function ProfileList({ emptyText, items, title }: ProfileListProps) {
  return (
    <div className="rounded-lg border border-theme-plum/10 bg-theme-cream/50 p-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-theme-ink/65">{emptyText}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li
              className="flex items-start gap-2 rounded-lg bg-white/65 p-2 text-sm"
              key={item.key}
            >
              {item.badge ? (
                <Badge tone={getIssueTone(item.badge)}>{item.badge}</Badge>
              ) : null}
              <span className="min-w-0 text-theme-ink/78">{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ColumnProfileTableProps {
  columnReports: ColumnProfileReport[];
}

function ColumnProfileTable({ columnReports }: ColumnProfileTableProps) {
  if (columnReports.length === 0) {
    return (
      <EmptyState title="No column report">
        Run the profile again to refresh column-level stats.
      </EmptyState>
    );
  }

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[0.7rem] font-extrabold uppercase text-theme-ink/68">
            Columns
          </span>
          <strong className="block text-base">Column profile</strong>
        </div>
        <Badge tone="lavender">
          {columnReports.length.toLocaleString()} column
          {columnReports.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <TableContainer className="max-h-[420px]">
        <Table className="min-w-[980px] table-fixed">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
          </colgroup>
          <TableHead className="sticky top-0 bg-theme-lilac/45">
            <TableRow>
              <TableHeaderCell>Column</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Missing</TableHeaderCell>
              <TableHeaderCell>Unique</TableHeaderCell>
              <TableHeaderCell>Empty text</TableHeaderCell>
              <TableHeaderCell>Min</TableHeaderCell>
              <TableHeaderCell>Max</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columnReports.map((column) => (
              <TableRow key={column.id}>
                <TableCell>
                  <strong className="block truncate font-semibold">
                    {column.columnName}
                  </strong>
                  <small className="block text-xs text-theme-ink/58">
                    #{column.ordinalPosition}
                  </small>
                </TableCell>
                <TableCell>
                  <Badge tone="neutral">
                    {column.inferredType ?? column.declaredType ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatRatioWithCount(column.nullCount, column.nullRatio)}
                </TableCell>
                <TableCell>
                  {formatRatioWithCount(column.uniqueCount, column.uniqueRatio)}
                </TableCell>
                <TableCell>
                  {formatRatioWithCount(
                    column.emptyStringCount,
                    column.emptyStringRatio,
                  )}
                </TableCell>
                <TableCell className="truncate">
                  {formatProfileValue(column.minValue)}
                </TableCell>
                <TableCell className="truncate">
                  {formatProfileValue(column.maxValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}

interface MetadataPanelProps {
  items: Array<[string, string]>;
  title: string;
}

function MetadataPanel({ items, title }: MetadataPanelProps) {
  return (
    <section className="rounded-lg border border-theme-plum/10 bg-white/55 p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-lg bg-theme-cream/70 p-3" key={label}>
            <dt className="text-[0.7rem] font-extrabold uppercase text-theme-ink/68">
              {label}
            </dt>
            <dd className="mt-1 overflow-hidden text-ellipsis text-sm text-theme-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getSourceMetadata(dataSource: DataSource): Array<[string, string]> {
  const config = readSourceConfig(dataSource.configJson);

  return [
    ["Source type", dataSource.sourceType],
    ["Provider", dataSource.provider ?? "Unknown"],
    ["Original file", dataSource.sourceUri ?? "Not recorded"],
    ["Stored raw file", config.copiedRawPath ?? "Not copied"],
    [
      "CSV options",
      `delimiter "${config.delimiter ?? ","}", header ${
        config.hasHeader === false ? "no" : "yes"
      }`,
    ],
  ];
}

function getCurrentVersionMetadata(
  currentVersion: DatasetVersion | undefined,
  versionCount: number,
  datasetName: string | undefined,
): Array<[string, string]> {
  return [
    ["Dataset", datasetName ?? "Unknown"],
    ["Current version", currentVersion ? `v${currentVersion.versionNumber}` : "None"],
    ["Version count", versionCount.toLocaleString()],
    ["Storage", currentVersion?.storageFormat ?? "Unknown"],
    ["Rows", currentVersion?.rowCount?.toLocaleString() ?? "Unknown"],
    ["Columns", String(currentVersion?.columnCount ?? "Unknown")],
    ["Size", formatFileSize(currentVersion?.sizeBytes)],
    ["Parquet", currentVersion?.storageUri ?? "Not created"],
    ["Created", currentVersion ? formatDateTime(currentVersion.createdAt) : "Unknown"],
  ];
}

interface VersionsBlockProps {
  currentVersion?: DatasetVersion;
  versionCount: number;
}

function VersionsBlock({ currentVersion, versionCount }: VersionsBlockProps) {
  return (
    <section className="rounded-lg border border-theme-plum/10 bg-white/55 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Versions</h3>
          <p className="mt-1 text-sm text-theme-ink/68">
            Showing the current version. Older version browsing can expand here.
          </p>
        </div>
        <Badge tone="lavender">
          {versionCount.toLocaleString()} version{versionCount === 1 ? "" : "s"}
        </Badge>
      </div>
      {currentVersion ? (
        <div className="mt-3 rounded-lg bg-theme-cream/70 p-3 text-sm">
          Current: v{currentVersion.versionNumber} -{" "}
          {currentVersion.storageFormat} -{" "}
          {formatDateTime(currentVersion.createdAt)}
        </div>
      ) : null}
    </section>
  );
}

interface DataSourcePreviewBlockProps {
  dataSourceId: string;
  loadPreview: (dataSourceId: string) => Promise<void>;
  previewState?: PreviewState;
}

function DataSourcePreviewBlock({
  dataSourceId,
  loadPreview,
  previewState,
}: DataSourcePreviewBlockProps) {
  const preview = previewState?.preview;

  return (
    <section className="grid gap-3 rounded-lg border border-theme-plum/10 bg-white/55 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[0.7rem] font-extrabold uppercase text-theme-ink/68">
            Preview
          </span>
          <strong className="block text-base">Current version rows</strong>
        </div>
        <Button
          disabled={previewState?.isLoading}
          onClick={() => void loadPreview(dataSourceId)}
          variant="secondary"
        >
          <FiEye aria-hidden="true" />
          {previewState?.isLoading ? "Loading..." : "Load preview"}
        </Button>
      </div>

      {previewState?.error ? (
        <p className="text-sm font-semibold text-[#9F4959]">
          {previewState.error}
        </p>
      ) : null}

      {preview ? (
        <TableContainer className="max-h-[380px]">
          <Table>
            <TableHead className="sticky top-0 bg-theme-lilac/45">
              <TableRow>
                {preview.columns.map((column) => (
                  <TableHeaderCell key={column}>{column}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {preview.columns.map((column) => (
                    <TableCell
                      className="max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap"
                      key={column}
                    >
                      {formatPreviewValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </section>
  );
}

interface ProfileIssue {
  code?: string;
  message?: string;
  severity?: string;
}

interface ProfileAction {
  code?: string;
  message?: string;
}

function readJsonArray<T>(json: string | undefined): T[] {
  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatRatioWithCount(
  count: number | undefined,
  ratio: number | undefined,
): string {
  const countText = count?.toLocaleString() ?? "0";
  const percentText =
    ratio === undefined ? "0%" : `${Math.round(ratio * 1000) / 10}%`;

  return `${countText} (${percentText})`;
}

function formatProfileValue(value: string | undefined): string {
  if (!value) {
    return "None";
  }

  return value;
}

function getQualityTone(
  score: number | undefined,
): ProfileMetricProps["tone"] {
  if (score === undefined) {
    return "lavender";
  }

  if (score >= 85) {
    return "mint";
  }

  if (score >= 65) {
    return "lavender";
  }

  return "peach";
}

function getIssueTone(value: string): "mint" | "lavender" | "peach" | "neutral" {
  if (/high|empty|duplicate|missing/i.test(value)) {
    return "peach";
  }

  if (/low|info/i.test(value)) {
    return "mint";
  }

  return "lavender";
}

function formatFileSize(fileSizeBytes: number | undefined): string {
  if (fileSizeBytes === undefined) {
    return "Unknown";
  }

  if (fileSizeBytes < 1024) {
    return `${fileSizeBytes} B`;
  }

  if (fileSizeBytes < 1024 * 1024) {
    return `${(fileSizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function readSourceConfig(configJson: string | undefined): {
  copiedRawPath?: string;
  delimiter?: string;
  hasHeader?: boolean;
} {
  if (!configJson) {
    return {};
  }

  try {
    const parsed = JSON.parse(configJson) as {
      copiedRawPath?: unknown;
      delimiter?: unknown;
      hasHeader?: unknown;
    };

    return {
      copiedRawPath:
        typeof parsed.copiedRawPath === "string"
          ? parsed.copiedRawPath
          : undefined,
      delimiter:
        typeof parsed.delimiter === "string" ? parsed.delimiter : undefined,
      hasHeader:
        typeof parsed.hasHeader === "boolean" ? parsed.hasHeader : undefined,
    };
  } catch {
    return {};
  }
}

function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
