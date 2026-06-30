import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Elysia server is running!",
  }))
  .get("/users", async ({ set }) => {
    try {
      const result = await db.select().from(users);
      return result;
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })
  .post("/users", async ({ body, set }) => {
    try {
      const [result] = await db.insert(users).values({
        name: body.name,
        email: body.email,
      });
      
      set.status = 210; // Created
      return {
        success: true,
        data: {
          id: result.insertId,
          name: body.name,
          email: body.email,
        }
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: 'email' }),
    })
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
export type App = typeof app;
