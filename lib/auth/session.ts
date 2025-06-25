import { cookies } from "next/headers";
import pool from "@/lib/db/connection";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  employee_id?: string;
  work_unit?: string;
  phone?: string;
  student_id?: string;
  study_program?: string;
  faculty?: string;
  whatsapp?: string;
  status: string;
  avatar?: string;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, created_date)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [sessionId, userId, expiresAt]
  );

  return sessionId;
}

export async function getSession(): Promise<User | null> {
  try {
    // Ambil cookie 'session' dari browser
    const sessionId = cookies().get("session")?.value;

    if (!sessionId) return null;

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.employee_id, u.work_unit, u.phone,
              u.student_id, u.study_program, u.faculty, u.whatsapp, u.status, u.avatar
       FROM users u
       JOIN sessions s ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
         AND u.is_active = true AND u.is_deleted = false`,
      [sessionId]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const sessionId = cookies().get("session")?.value;

    if (sessionId) {
      await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
    }
  } catch (error) {
    console.error("Delete session error:", error);
  }
}