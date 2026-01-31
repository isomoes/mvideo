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
