import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { User } from "../types/user.js";

const DB_PATH = process.env.USERS_DB_PATH ?? "./src/database/users.json";

async function ensureDatabase() {
  try {
    await readFile(DB_PATH, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify({ users: [] }), "utf-8");
  }
}

export async function save(user: User) {
  const old = await read();
  old.users.push(user);
  await writeFile(DB_PATH, JSON.stringify(old), "utf-8");
}

export async function read(): Promise<{ users: User[] }> {
  await ensureDatabase();
  const data = await readFile(DB_PATH, "utf-8");
  const database = JSON.parse(data) as { users: User[] };
  return database;
}
