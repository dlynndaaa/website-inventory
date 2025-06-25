import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";

export function withAuth(handler: Function, requiredRole?: string) {
  return async (request: NextRequest, context?: any) => {
    try {
      const user = await getSession();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (requiredRole && user.role !== requiredRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Tambahkan userId secara eksplisit agar bisa digunakan di handler
      const requestWithUser = request as NextRequest & { user: typeof user & { userId: string } };
      requestWithUser.user = { ...user, userId: user.id };

      return handler(requestWithUser, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
