// app/api/admin/candidates/route.js
// This API route handles CRUD operations for candidates in the admin panel. It includes:
// - GET: Fetches a list of all candidates with their details.
// - PUT: Updates a candidate's information based on their ID.
// - DELETE: Deletes a candidate from the database based on their ID.
import { pool } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        date,
        full_name,
        phone,
        email,
        interview_showed_up,
        vip,
        sold_by,
        nationality,
        current_position,
        candidate_status,
        desired_position,
        expected_salary,
        plan_type,
        payment_screenshot_url
      FROM candidates
      ORDER BY full_name ASC
    `);

    return NextResponse.json({ candidates: result.rows });
  } catch (err) {
    console.error("GET /api/admin/candidates ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();

    const result = await pool.query(
      `
      UPDATE candidates
      SET
        date = $1,
        full_name = $2,
        phone = $3,
        email = $4,
        interview_showed_up = $5,
        vip = $6,
        sold_by = $7,
        nationality = $8,
        current_position = $9,
        candidate_status = $10,
        desired_position = $11,
        expected_salary = $12,
        plan_type = $13,
        payment_screenshot_url = $14
      WHERE id = $15
      RETURNING *
      `,
      [
        body.date || null,
        body.full_name || null,
        body.phone || null,
        body.email || null,
        body.interview_showed_up ?? false,
        body.vip ?? false,
        body.sold_by || null,
        body.nationality || null,
        body.current_position || null,
        body.candidate_status || null,
        body.desired_position || null,
        body.expected_salary || null,
        body.plan_type || null,
        body.payment_screenshot_url || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ candidate: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/admin/candidates/:id ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    const result = await pool.query(
      `DELETE FROM candidates WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/admin/candidates/:id ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
