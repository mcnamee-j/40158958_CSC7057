import { describe, it, expect, afterAll, beforeAll } from "vitest";
import pool from "../src/config/db";
import request from "supertest";
import app from "../src/app";

let jane_token: string;
let jane_id: number;
let mark_token: string;
let mark_id: number;
let sarah_token: string;
let sarah_id: number;
let tom_token: string;
let tom_id: number;
let admin_token: string;
let aoife_token: string;

const PHARMACY_ORG_ID = 1; //from seed data - City Pharmacy Belfast
const GP_ORG_ID = 2; //Hillview surgery

//starts a clean db table, Restart identity - resets autoincrement ids, cascade handles foreign key dependents
beforeAll(async () => {
  await pool.query(
    `TRUNCATE refresh_tokens, password_reset_tokens, audit_log
     RESTART IDENTITY CASCADE`,
  );

  //log all users in and store token and id
  const jane = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@pharmacy.com", password: "Password123!" });
  jane_token = jane.body.access_token;
  jane_id = jane.body.user.id;

  const mark = await request(app)
    .post("/api/auth/login")
    .send({ email: "mark@pharmacy.com", password: "Password123!" });
  mark_token = mark.body.access_token;
  mark_id = mark.body.user.id;

  const sarah = await request(app)
    .post("/api/auth/login")
    .send({ email: "sarah@surgery.com", password: "Password123!" });
  sarah_token = sarah.body.access_token;
  sarah_id = sarah.body.user.id;

  const tom = await request(app)
    .post("/api/auth/login")
    .send({ email: "tom@surgery.com", password: "Password123!" });
  tom_token = tom.body.access_token;
  tom_id = tom.body.user.id;

  const admin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@loop.com", password: "Password123!" });
  admin_token = admin.body.access_token;

  const aoife = await request(app)
    .post("/api/auth/login")
    .send({ email: "aoife@riverside.com", password: "Password123!" });
  aoife_token = aoife.body.access_token;
});

afterAll(async () => {
  await pool.end();
});

//create a test query using jane
const create_test_query = async (overrides: Record<string, unknown> = {}) => {
  //override values used to assert values later in tests
  const res = await request(app)
    .post("/api/queries")
    .set("Authorization", `Bearer ${jane_token}`)
    .send({
      recipient_org_id: GP_ORG_ID,
      category: "prescription",
      subject: "Test query",
      body: "Test query body",
      ...overrides,
    });
  return res.body.query;
};

//create query
describe("POST /api/queries", () => {
  it("returns 201 and reference number for valid queries", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        category: "prescription",
        subject: "Query about repeat prescription",
        body: "Can you confirm the dosage is correct on this prescription?",
      });

    expect(res.status).toBe(201);
    expect(res.body.query).toHaveProperty("ref_number");
    expect(res.body.query.status).toBe("new");
    expect(res.body.query.priority).toBe("medium");
  });

  it("returns 401 when no token is used", async () => {
    const res = await request(app).post("/api/queries").send({
      recipient_org_id: GP_ORG_ID,
      category: "prescription",
      subject: "Test",
      body: "Test",
    });

    expect(res.status).toBe(401);
  });

  it("returns 403 for an unauthorised role", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${admin_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        category: "prescription",
        subject: "Test",
        body: "Test",
      });

    expect(res.status).toBe(403);
  });

  it("returns 403 when recipient org is not a linked org", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: 999,
        category: "prescription",
        subject: "Test",
        body: "Test",
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Organisations are not linked");
  });

  it("returns 400 when category is missing", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        subject: "Test",
        body: "Test",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when patient has only one identifier", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        category: "patient",
        subject: "Test",
        body: "Test",
        patient: { initials: "JS" },
      });

    expect(res.status).toBe(400);
  });

  it("returns 201 when patient has two identifiers", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        category: "patient",
        subject: "Test",
        body: "Test",
        patient: { initials: "JS", dob: "1987-09-25" },
      });

    expect(res.status).toBe(201);
    expect(res.body.query.patient_id).not.toBeNull();
  });

  it("returns 201 with a null patient_id when no patient is given", async () => {
    const res = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        recipient_org_id: GP_ORG_ID,
        category: "stock",
        subject: "Stock query",
        body: "Do you have this item in stock?",
      });

    expect(res.status).toBe(201);
    expect(res.body.query.patient_id).toBeNull();
  });
});

//list queries
describe("GET /api/queries", () => {
  it("returns 200 and lists queries relevant to requesting org", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .get("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("queries");
    expect(res.body).toHaveProperty("total");
    expect(res.body.queries.some((query: any) => query.id === created.id)).toBe(
      true,
    ); //.some requires one query in array to match
  });

  it("returns the same query to the recipient org", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .get("/api/queries")
      .set("Authorization", `Bearer ${sarah_token}`);

    expect(res.status).toBe(200);
    expect(res.body.queries.some((query: any) => query.id === created.id)).toBe(
      true,
    );
  });

  it("filters by status", async () => {
    const res = await request(app)
      .get("/api/queries?status=new")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.queries.every((query: any) => query.status === "new")).toBe(
      true,
    );
  });

  it("filters by priority", async () => {
    await create_test_query({ priority: "high" });

    const res = await request(app)
      .get("/api/queries?priority=high")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(
      res.body.queries.every((query: any) => query.priority === "high"),
    ).toBe(true);
  });

  it("combines filters with 'AND' logic", async () => {
    const res = await request(app)
      .get("/api/queries?status=new&priority=high")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(
      res.body.queries.every(
        (query: any) => query.status === "new" && query.priority === "high",
      ),
    ).toBe(true);
  });

  it("returns elapsed_seconds on each query", async () => {
    await create_test_query();

    const res = await request(app)
      .get("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.queries[0]).toHaveProperty("elapsed_seconds");
  });

  it("returns an empty array for an organisation with no involvement", async () => {
    const res = await request(app)
      .get("/api/queries")
      .set("Authorization", `Bearer ${aoife_token}`);

    expect(res.status).toBe(200);
    expect(res.body.queries).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  //added after backend adjustments to get org names to frontend
  it("includes sender org name and creator name in the list", async () => {
    await create_test_query();

    const res = await request(app)
      .get("/api/queries")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    const created = res.body.queries.find(
      (query: any) => query.created_by_first_name,
    );
    expect(created).toBeDefined();
    expect(created.sender_org_name).toBe("City Pharmacy Belfast");
  });
});

//get query by id
describe("GET /api/queries/:id", () => {
  it("returns 200 with the query and its replies", async () => {
    const created = await create_test_query({ body: "Original query message" });

    const res = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.query.id).toBe(created.id);
    expect(res.body.replies[0].body).toBe("Original query message");
  });

  it("marks other org messages as read", async () => {
    const created = await create_test_query();

    await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${sarah_token}`);

    const check = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${jane_token}`);

    expect(check.body.replies[0].read_at).not.toBeNull();
  });

  it("returns 404 for a non-existent query", async () => {
    const res = await request(app)
      .get("/api/queries/999999")
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(404);
  });

  it("returns replies in chronological order", async () => {
    const created = await create_test_query();

    await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .set("Authorization", `Bearer ${sarah_token}`)
      .send({ body: "First reply" });

    const res = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${jane_token}`);

    const timestamps = res.body.replies.map((reply: any) =>
      new Date(reply.sent_at).getTime(),
    );
    const sorted = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).toEqual(sorted);
  });

  it("hides internal notes from external organisations", async () => {
    const created = await create_test_query();

    await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ body: "Internal note", is_internal: true });

    const own_org = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${mark_token}`);

    const other_org = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${sarah_token}`);

    expect(
      own_org.body.replies.some((reply: any) => reply.body === "Internal note"),
    ).toBe(true);
    expect(
      other_org.body.replies.some(
        (reply: any) => reply.body === "Internal note",
      ),
    ).toBe(false);
  });

  it("returns 404 for a query belonging to an unrelated organisation", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${aoife_token}`);

    expect(res.status).toBe(404);
  });

  it("includes sender org name and creator name", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${jane_token}`);

    expect(res.status).toBe(200);
    expect(res.body.query.sender_org_name).toBe("City Pharmacy Belfast");
    expect(res.body.query.recipient_org_name).toBe("Hillview Surgery");
    expect(res.body.query.created_by_first_name).toBe("Jane");
  });
});

//query replies
describe("POST /api/queries/:id/replies", () => {
  it("returns 201 for a valid reply", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .set("Authorization", `Bearer ${sarah_token}`)
      .send({ body: "Confirmed with doctor - the dose is correct" });

    expect(res.status).toBe(201);
    expect(res.body.reply.is_internal).toBe(false);
  });

  it("returns 400 when body is empty", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ body: "" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when body is missing", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when the query does not exist", async () => {
    const res = await request(app)
      .post("/api/queries/999999/replies")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ body: "Test reply" });

    expect(res.status).toBe(404);
  });

  it("returns 401 when no token is provided", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .post(`/api/queries/${created.id}/replies`)
      .send({ body: "Test reply" });

    expect(res.status).toBe(401);
  });
});

//status
describe("PATCH /api/queries/:id/status", () => {
  it("returns 200 for valid status change", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.query.status).toBe("in_progress");
  });

  it("returns 400 for an invalid status value", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "closed" });

    expect(res.status).toBe(400);
  });

  it("sets resolved_at and adds a reply to the thread when a resolution note is added", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({
        status: "resolved",
        resolution_note: "Dosage confirmed with doctor",
      });

    expect(res.status).toBe(200);
    expect(res.body.query.resolved_at).not.toBeNull();

    const thread = await request(app)
      .get(`/api/queries/${created.id}`)
      .set("Authorization", `Bearer ${jane_token}`);

    expect(
      thread.body.replies.some((reply: any) =>
        reply.body.includes("Dosage confirmed with doctor"),
      ),
    ).toBe(true);
  });

  it("allows resolving without a resolution note", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(200);
    expect(res.body.query.resolution_note).toBeNull();
  });

  it("clears resolved_at when a resolved query is reopened", async () => {
    const created = await create_test_query();

    await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "resolved" });

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.query.resolved_at).toBeNull();
  });

  it("returns 400 when status is missing", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent query", async () => {
    const res = await request(app)
      .patch("/api/queries/999999/status")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "in_progress" });

    expect(res.status).toBe(404);
  });
});

//assign
describe("PATCH /api/queries/:id/assign", () => {
  it("returns 200 and assigns to an internal staff member", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/assign`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ assigned_to: mark_id });

    expect(res.status).toBe(200);
    expect(res.body.query.assigned_to).toBe(mark_id);
  });

  it("returns 400 when assigning to a user in an external org", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/assign`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ assigned_to: sarah_id });

    expect(res.status).toBe(400);
  });

  it("sets status to escalated when escalate is passed as true", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/assign`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ assigned_to: mark_id, escalate: true });

    expect(res.status).toBe(200);
    expect(res.body.query.status).toBe("escalated");
  });

  it("returns 400 when assigned_to is missing", async () => {
    const created = await create_test_query();

    const res = await request(app)
      .patch(`/api/queries/${created.id}/assign`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent query", async () => {
    const res = await request(app)
      .patch("/api/queries/999999/assign")
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ assigned_to: mark_id });

    expect(res.status).toBe(404);
  });

  it("returns 400 when assigning to an inactive user", async () => {
    await pool.query(`UPDATE users SET active = false WHERE id = $1`, [tom_id]); //sets tom to inactive (resets at end)

    const created = await request(app)
      .post("/api/queries")
      .set("Authorization", `Bearer ${sarah_token}`)
      .send({
        recipient_org_id: PHARMACY_ORG_ID,
        category: "prescription",
        subject: "Test query from GP surgery",
        body: "Test",
      });

    const res = await request(app)
      .patch(`/api/queries/${created.body.query.id}/assign`)
      .set("Authorization", `Bearer ${sarah_token}`)
      .send({ assigned_to: tom_id });

    expect(res.status).toBe(400);

    //reset tom for other tests
    await pool.query(`UPDATE users SET active = true WHERE id = $1`, [tom_id]);
  });
});

//audit_log
describe("audit log entries for query actions", () => {
  it("creates an audit log entry when a query is created", async () => {
    const created = await create_test_query();

    const result = await pool.query(
      `SELECT * 
        FROM audit_log
        WHERE action = 'query_created' 
        AND query_id = $1`,
      [created.id],
    );

    expect(result.rows.length).toBeGreaterThan(0);
  });

  it("creates an audit log entry when status changes", async () => {
    const created = await create_test_query();

    await request(app)
      .patch(`/api/queries/${created.id}/status`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ status: "in_progress" });

    const result = await pool.query(
      `SELECT * 
      FROM audit_log
      WHERE action = 'status_changed' 
      AND query_id = $1`,
      [created.id],
    );

    expect(result.rows.length).toBeGreaterThan(0);
  });

  it("creates two audit log entries when assigning with escalation", async () => {
    const created = await create_test_query();

    await request(app)
      .patch(`/api/queries/${created.id}/assign`)
      .set("Authorization", `Bearer ${jane_token}`)
      .send({ assigned_to: mark_id, escalate: true });

    const result = await pool.query(
      `SELECT * 
      FROM audit_log 
      WHERE query_id = $1 
      AND action 
      IN ('query_assigned', 'status_changed')`,
      [created.id],
    );

    expect(result.rows.length).toBe(2);
  });
});
