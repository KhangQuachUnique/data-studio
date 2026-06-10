import { Route, Routes } from "react-router-dom";
import { WorkspacesPage } from "@renderer/pages/workspaces/WorkspacesPage";
import { appPathPatterns } from "@renderer/shared/constants/appPaths";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={appPathPatterns.home} element={<WorkspacesPage />} />
      <Route path={appPathPatterns.workspaceTab} element={<WorkspacesPage />} />
      <Route path={appPathPatterns.workspace} element={<WorkspacesPage />} />
    </Routes>
  );
}
