import type { Workspace } from "@shared/types/Workspace";

export interface WorkspaceRepository {
  findAll(): Promise<Workspace[]>;

  findById(id: string): Promise<Workspace | null>;

  findBySlug(slug: string): Promise<Workspace | null>;

  create(workspace: Workspace): Promise<Workspace>;

  update(workspace: Workspace): Promise<Workspace>;
}
