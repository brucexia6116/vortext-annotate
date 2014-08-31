-- name: get-document
-- Gets the document associated with a specific fingerprint
SELECT * FROM documents WHERE id = :id

-- name: create-document<!
-- Creates a document associated with a specific project, no-op if already present
WITH documents_id AS (
     INSERT INTO documents ("id", "file", "name") SELECT :fingerprint, :file, :name
     WHERE NOT EXISTS (SELECT id FROM documents WHERE id = :fingerprint))
INSERT INTO documents_projects (documents_id, projects_id) SELECT :fingerprint, :project_id
WHERE NOT EXISTS (SELECT 1 FROM documents_projects WHERE documents_id = :fingerprint AND projects_id = :project_id)

-- name: create-marginalia!
-- Creates marginalia specified with a specific project and fingerprint
INSERT INTO marginalia (documents_id, projects_id, marginalis) VALUES (:document_id, :project_id, CAST(:marginalis AS json))

-- name: get-marginalia
-- Returns the marginalia associated with a specific document and project
SELECT marginalis FROM marginalia WHERE documents_id = :document_id AND projects_id = :project_id

-- name: documents-by-project
-- Get all the documents associated with a specific project_id
SELECT documents.id AS fingerprint, documents.name, documents.last_updated
FROM documents, documents_projects
WHERE documents_projects.projects_id = :project_id AND documents_projects.documents_id = documents.id
