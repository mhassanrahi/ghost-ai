-- DropIndex
-- task_runs_run_id_idx (non-unique) is superseded by the unique constraint
-- task_runs_run_id_key added via @unique on run_id; duplicate index removed.
DROP INDEX "task_runs_run_id_idx";

-- CreateTable
CREATE TABLE "project_specs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_specs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_specs_project_id_idx" ON "project_specs"("project_id");

-- AddForeignKey
ALTER TABLE "project_specs" ADD CONSTRAINT "project_specs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
