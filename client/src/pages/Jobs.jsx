/* This code snippet is a React component named `Jobs`. Here's a breakdown of what it does: */
import { useEffect, useState } from "react";
import { getJobs } from "../api/jobs";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    getJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Open Jobs</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {jobs.length === 0 && !err && <p>No jobs yet.</p>}

      {jobs.map((j) => (
        <div
          key={j.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>{j.title}</h3>
          <p style={{ margin: "6px 0" }}>
            {j.location} • {j.employment_type}
          </p>
          <small>
            Status: {j.status} • {new Date(j.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
