import { FormEvent, useState } from "react";
import type { CreateWorkspaceInput } from "@shared/workspace/dtos";

interface CreateWorkspaceFormProps {
  error: string | null;
  isCreating: boolean;
  onCreateWorkspace: (input: CreateWorkspaceInput) => Promise<void>;
}

export function CreateWorkspaceForm({
  error,
  isCreating,
  onCreateWorkspace,
}: CreateWorkspaceFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!name.trim()) {
      setValidationError("Workspace name is required.");
      return;
    }

    setValidationError(null);

    await onCreateWorkspace({
      name,
      description: description.trim() || undefined,
    });

    setName("");
    setDescription("");
  }

  return (
    <form className="workspace-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>New workspace</h2>
        <p className="muted">Create isolated local storage for a project.</p>
      </div>
      <label>
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sales analysis"
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional notes for this workspace"
          rows={3}
        />
      </label>
      <button disabled={isCreating} type="submit">
        {isCreating ? "Creating..." : "Create workspace"}
      </button>
      {validationError ? <p className="error-message">{validationError}</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
    </form>
  );
}
