-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'learner',
    "skill_level" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "skill_area" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSkill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "content_data_text" TEXT NOT NULL,
    "ai_topics_text" TEXT NOT NULL,
    "estimated_time" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "completion_rate" DECIMAL NOT NULL DEFAULT 0,
    "skill_points" INTEGER NOT NULL DEFAULT 0,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserProgress_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "LearningContent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BPRProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "current_process_text" TEXT,
    "target_process_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "metrics_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "BPRProject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "analysis_data_text" TEXT NOT NULL,
    "ai_confidence_score" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcessAnalysis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "BPRProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserSkill_user_id_skill_area_idx" ON "UserSkill"("user_id", "skill_area");

-- CreateIndex
CREATE INDEX "UserProgress_user_id_content_id_idx" ON "UserProgress"("user_id", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_user_id_content_id_key" ON "UserProgress"("user_id", "content_id");

-- CreateIndex
CREATE INDEX "BPRProject_user_id_status_idx" ON "BPRProject"("user_id", "status");

-- CreateIndex
CREATE INDEX "ProcessAnalysis_project_id_idx" ON "ProcessAnalysis"("project_id");
