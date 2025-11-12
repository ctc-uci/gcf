import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../app";

describe("sample router", () => {
  it("GET / should return 200 and a JSON body", async () => {
    const res = await request(app).get("/").send();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello, world!" });
  });
});
