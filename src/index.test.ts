import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "./index";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

describe("User Registration API", () => {
  const testEmail = "fadil.test@gmail.com";
  const testPassword = "password123";
  const testName = "Fadil Test";

  beforeAll(async () => {
    // Bersihkan user tes jika sudah ada
    await db.delete(users).where(eq(users.email, testEmail));
  });

  it("should successfully register a new user", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword,
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ data: "OK" });

    // Verifikasi database dan enkripsi password
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    expect(dbUser).toBeDefined();
    if (!dbUser) {
      throw new Error("User tidak ditemukan di database");
    }
    expect(dbUser.name).toBe(testName);
    expect(dbUser.email).toBe(testEmail);
    expect(dbUser.password).not.toBe(testPassword); // password must be hashed

    const isPasswordValid = await Bun.password.verify(testPassword, dbUser.password);
    expect(isPasswordValid).toBe(true);
  });

  it("should fail to register user with duplicate email", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword,
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "Email sudah terdaftar" });
  });
});
