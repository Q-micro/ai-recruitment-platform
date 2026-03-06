export default function CandidateDashboard() {
  const stats = [
    { label: "Applications Sent", value: 12, hint: "+3 this week" },
    { label: "Saved Jobs", value: 8, hint: "2 new matches" },
    { label: "Interviews", value: 3, hint: "1 upcoming" },
    { label: "Profile Strength", value: "86%", hint: "Add certifications" },
  ];

  const recommendedJobs = [
    {
      title: "Frontend Developer Intern",
      company: "Spark Labs",
      location: "Remote",
      type: "Internship",
      posted: "2 days ago",
      tags: ["React", "UI", "JavaScript"],
    },
    {
      title: "Junior UX Designer",
      company: "Blue Orbit",
      location: "Manama, Bahrain",
      type: "Full-time",
      posted: "1 day ago",
      tags: ["Figma", "Wireframes", "Design Systems"],
    },
    {
      title: "Software Engineer Trainee",
      company: "NovaTech",
      location: "Hybrid",
      type: "Training Program",
      posted: "Today",
      tags: ["Problem Solving", "APIs", "Teamwork"],
    },
  ];

  const applications = [
    {
      role: "Frontend Developer Intern",
      company: "Spark Labs",
      status: "Interview",
      date: "Mar 4",
    },
    {
      role: "UI/UX Designer",
      company: "Pixel House",
      status: "Under Review",
      date: "Mar 2",
    },
    {
      role: "Junior Web Developer",
      company: "CloudNest",
      status: "Submitted",
      date: "Feb 28",
    },
  ];

  const learning = [
    "Complete your profile photo and headline",
    "Add one more project to boost visibility",
    "Tailor your CV for frontend roles",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Khutwa</p>
            <h1 className="text-2xl font-bold tracking-tight">Candidate Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50">
              Edit Profile
            </button>
            <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90">
              Browse Jobs
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Welcome back, Sara</p>
                <h2 className="text-3xl font-bold">Keep your momentum going.</h2>
                <p className="max-w-xl text-sm text-slate-300">
                  You have 3 active applications and new roles that match your skills in React, UI design, and frontend development.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Next Interview</p>
                <p className="mt-2 text-lg font-semibold">Spark Labs</p>
                <p className="text-sm text-slate-300">Sunday · 11:00 AM</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{item.value}</p>
                <p className="mt-2 text-xs font-medium text-emerald-600">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Recommended Jobs</h3>
                <p className="text-sm text-slate-500">Roles picked based on your profile and interests</p>
              </div>
              <button className="text-sm font-semibold text-slate-700 hover:text-slate-900">View all</button>
            </div>

            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <div key={job.title} className="rounded-3xl border border-slate-200 p-5 transition hover:shadow-md">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold">{job.title}</h4>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {job.company} · {job.location}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span className="text-xs text-slate-500">Posted {job.posted}</span>
                      <div className="flex gap-2">
                        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                          Save
                        </button>
                        <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Application Tracker</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {applications.map((item) => (
                <div key={`${item.role}-${item.company}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Updated {item.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold">Profile Boost Tips</h3>
            <p className="mt-1 text-sm text-slate-500">Small updates that can improve visibility</p>
            <div className="mt-4 space-y-3">
              {learning.map((tip) => (
                <div key={tip} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
            <p className="text-sm text-slate-300">Quick Action</p>
            <h3 className="mt-2 text-xl font-semibold">Complete your profile</h3>
            <p className="mt-2 text-sm text-slate-300">
              Add your projects, portfolio link, and skills so employers can find you faster.
            </p>
            <button className="mt-5 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Update Profile
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
