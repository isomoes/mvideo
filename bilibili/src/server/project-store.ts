import { promises as fs } from "fs";
import path from "path";
import type { Project } from "../../types/models";
import { deserializeProject, serializeProject } from "../services/project-serialization";
import { ensureDir, getStorageRoot } from "./asset-store";

const getProjectsRoot = (): string => {
  return path.join(getStorageRoot(), "projects");
};

export const getProjectDir = (projectId: string): string => {
  return path.join(getProjectsRoot(), projectId);
};

export const getProjectPath = (projectId: string): string => {
  return path.join(getProjectDir(projectId), "project.json");
};

export const writeProject = async (project: Project): Promise<void> => {
  const projectDir = getProjectDir(project.id);
  await ensureDir(projectDir);
  const projectPath = getProjectPath(project.id);
  await fs.writeFile(projectPath, serializeProject(project));
};

export const readProject = async (projectId: string): Promise<Project | null> => {
  try {
    const projectPath = getProjectPath(projectId);
    const contents = await fs.readFile(projectPath, "utf-8");
    return deserializeProject(contents);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const listProjects = async (): Promise<Project[]> => {
  const projectsRoot = getProjectsRoot();

  try {
    const entries = await fs.readdir(projectsRoot, { withFileTypes: true });
    const records = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => readProject(entry.name)),
    );

    return records
      .filter((record): record is Project => Boolean(record))
      .sort((a, b) => (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projectDir = getProjectDir(projectId);
  await fs.rm(projectDir, { recursive: true, force: true });
};

export const updateProject = async (
  projectId: string,
  update: Partial<Project>,
): Promise<Project> => {
  const existing = await readProject(projectId);
  if (!existing) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const now = new Date().toISOString();
  const next: Project = {
    ...existing,
    ...update,
    id: existing.id,
    schemaVersion: existing.schemaVersion,
    createdAt: existing.createdAt,
    updatedAt: now,
  };

  await writeProject(next);
  return next;
};

export const getProjectFilesDir = (projectId: string): string => {
  return path.join(getProjectDir(projectId), "files");
};

export const writeProjectFile = async (
  projectId: string,
  filename: string,
  contents: Buffer,
): Promise<string> => {
  const filesDir = getProjectFilesDir(projectId);
  await ensureDir(filesDir);
  const filePath = path.join(filesDir, filename);
  await fs.writeFile(filePath, contents);
  return filePath;
};

export const readProjectFile = async (
  projectId: string,
  filename: string,
): Promise<Buffer | null> => {
  try {
    const filePath = path.join(getProjectFilesDir(projectId), filename);
    return await fs.readFile(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const listProjectFiles = async (projectId: string): Promise<string[]> => {
  const filesDir = getProjectFilesDir(projectId);

  try {
    const entries = await fs.readdir(filesDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const deleteProjectFile = async (
  projectId: string,
  filename: string,
): Promise<void> => {
  const filePath = path.join(getProjectFilesDir(projectId), filename);
  await fs.rm(filePath, { force: true });
};
