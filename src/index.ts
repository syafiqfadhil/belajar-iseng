import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Elysia server is running!",
  }))
  .get("/users", async ({ set }) => {
    try {
      const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      }).from(users);
      return result;
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
export type App = typeof app;
