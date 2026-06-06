import { formatDateTime } from "@renderer/shared/lib/formatDateTime";
import type { useDataSources } from "../hooks/useDataSources";

type DataSourceState = ReturnType<typeof useDataSources>;

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
    error,
    importCsv,
    isImporting,
    isLoading,
    loadDataSources,
  } = dataSourceState;
  const totalRows = dataSources.reduce(
    (sum, dataSource) => sum + (dataSource.rowCount ?? 0),
    0,
  );
  const readyCount = dataSources.filter(
    (dataSource) => dataSource.status === "READY",
  ).length;
  const latestDataSource = dataSources[0];

  return (
    <section className="data-source-panel">
      <div className="studio-section-header">
        <div>
          <p className="eyebrow">Data sources</p>
          <h2>Datasets</h2>
        </div>
        <div className="panel-actions">
          <button
            className="secondary-button"
            onClick={() => void loadDataSources()}
          >
            Refresh
          </button>
          <button
            disabled={isImporting || isReadOnly}
            onClick={() => void importCsv()}
          >
            {isReadOnly
              ? "Archived"
              : isImporting
                ? "Importing..."
                : "Import CSV"}
          </button>
        </div>
      </div>

      {isReadOnly ? (
        <p className="muted">
          This workspace is archived, so data sources are view-only.
        </p>
      ) : null}

      {error ? <p className="error-message">{error}</p> : null}

      {isLoading ? <p className="muted">Loading data sources...</p> : null}

      <div className="studio-metrics">
        <div>
          <span>Datasets</span>
          <strong>{dataSources.length}</strong>
        </div>
        <div>
          <span>Ready</span>
          <strong>{readyCount}</strong>
        </div>
        <div>
          <span>Total rows</span>
          <strong>{totalRows.toLocaleString()}</strong>
        </div>
        <div>
          <span>Latest</span>
          <strong>{latestDataSource?.name ?? "None"}</strong>
        </div>
      </div>

      {!isLoading && dataSources.length === 0 ? (
        <div className="empty-state">
          <strong>No data sources yet</strong>
          <p>Import a CSV file to create the first dataset version.</p>
        </div>
      ) : null}

      {dataSources.length > 0 ? (
        <div className="data-source-table" role="table">
          <div className="data-source-row data-source-row-head" role="row">
            <span>Name</span>
            <span>Status</span>
            <span>Rows</span>
            <span>Columns</span>
            <span>Updated</span>
          </div>
          {dataSources.map((dataSource) => (
            <details className="data-source-row-wrap" key={dataSource.id}>
              <summary className="data-source-row" role="row">
                <span>
                  <strong>{dataSource.name}</strong>
                  <small>{dataSource.type}</small>
                </span>
                <span className="status-stack">
                  <span className="status-pill">{dataSource.status}</span>
                  <span className="status-pill muted-pill">
                    Profile {dataSource.profileStatus}
                  </span>
                </span>
                <span>{dataSource.rowCount?.toLocaleString() ?? "Unknown"}</span>
                <span>{dataSource.columnCount ?? "Unknown"}</span>
                <span>{formatDateTime(dataSource.updatedAt)}</span>
              </summary>

              <div className="data-source-detail">
                <div>
                  <span>Version</span>
                  <code>{dataSource.currentVersionId ?? "Not set"}</code>
                </div>
                <div>
                  <span>Raw file</span>
                  <code>{dataSource.storedPath ?? "Not copied"}</code>
                </div>
                <div>
                  <span>Reserved table</span>
                  <code>{dataSource.tableName ?? "Not created"}</code>
                </div>
                <div>
                  <span>CSV options</span>
                  <code>
                    delimiter "{dataSource.delimiter ?? ","}", header{" "}
                    {dataSource.hasHeader ? "yes" : "no"}
                  </code>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
