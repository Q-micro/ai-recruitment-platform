/**
 * The `AdminDashboard` function in this React component displays various statistics and charts related
 * to candidates, jobs, and sales for an admin user.
 * @returns The code is returning a React functional component named `AdminDashboard`. This component
 * is a part of an admin dashboard application and includes various sub-components like `GlassCard`,
 * `MiniStatCard`, `JobsSummaryCard`, `StageBarChartCard`, and `VipVsNormalLineChartCard`.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import WorkOffRoundedIcon from "@mui/icons-material/WorkOffRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import AdminLayout from "../../components/AdminLayout";

const API_BASE_URL = "http://localhost:3001";

const SALES_FIELDS = [
  "sales_generated",
  "sale_amount",
  "sales_amount",
  "amount_paid",
  "paid_amount",
  "price",
  "total_price",
  "final_price",
  "revenue",
];

const THEME = {
  card: "rgba(12, 18, 32, 0.64)",
  cardStrong: "rgba(10, 16, 28, 0.78)",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.06)",
  text: "#f8fafc",
  subtext: "rgba(248,250,252,0.68)",
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  slate: "#94a3b8",
};

function getCandidateStatus(candidate) {
  const status =
    candidate?.recruitment_status ||
    candidate?.latest_recruitment_status ||
    candidate?.candidate_status ||
    candidate?.current_stage;

  if (status && String(status).trim() !== "") {
    return String(status).trim();
  }

  if (candidate?.interview_showed_up === true) return "Interviewed";
  return "Applied";
}

function normalizeStage(status) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "applied") return "Applied";
  if (value === "contacted") return "Applied";
  if (value === "ats cv generated") return "Applied";
  if (value === "cv sent") return "Applied";

  if (value === "interview scheduled") return "Interviewed";
  if (value === "interviewed") return "Interviewed";
  if (value === "interview") return "Interviewed";

  if (value === "offer") return "Offer";
  if (value === "hired") return "Hired";
  if (value === "placed") return "Hired";
  if (value === "rejected") return "Rejected";
  if (value === "waitlist") return "Waitlist";
  if (value === "on hold") return "Waitlist";

  return "Applied";
}

function isVipCandidate(candidate) {
  if (candidate?.vip === true || candidate?.is_vip === true) return true;
  const candidateType = String(candidate?.candidate_type || "")
    .toLowerCase()
    .trim();
  const type = String(candidate?.type || "")
    .toLowerCase()
    .trim();
  const category = String(candidate?.category || "")
    .toLowerCase()
    .trim();
  const tier = String(candidate?.tier || "")
    .toLowerCase()
    .trim();
  return (
    candidateType === "vip" ||
    type === "vip" ||
    category === "vip" ||
    tier === "vip"
  );
}

function getValidDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getNumericValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value === null || value === undefined || value === "") continue;
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return 0;
}

function formatCompact(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function getMonthOptions() {
  const options = [{ label: "All Time", value: "all" }];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    options.push({ label, value });
  }
  return options;
}

function getMonthKey(dateValue) {
  const d = getValidDate(dateValue);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isDateInSelectedFilter(dateValue, selectedMonth) {
  if (selectedMonth === "all") return true;
  return getMonthKey(dateValue) === selectedMonth;
}

function GlassCard({ children, sx = {} }) {
  return (
    <Card
      elevation={0}
      sx={{
        background: THEME.card,
        border: `1px solid ${THEME.border}`,
        backdropFilter: "blur(16px)",
        borderRadius: 4,
        boxShadow: "0 14px 40px rgba(0,0,0,0.24)",
        overflow: "hidden",
        position: "relative",
        transition:
          "transform 180ms ease, border-color 180ms ease, background 180ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: "rgba(255,255,255,0.16)",
        },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

function MiniStatCard({ title, value, subtitle, icon, accent }) {
  return (
    <GlassCard
      sx={{
        height: "100%",
        background: `
          radial-gradient(circle at 90% 18%, ${accent}18, transparent 26%),
          linear-gradient(180deg, rgba(10,16,28,0.82) 0%, rgba(10,16,28,0.68) 100%)
        `,
      }}
    >
      <CardContent sx={{ p: { xs: 1.8, sm: 2.1, md: 2.4 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ color: THEME.subtext, fontSize: 12.5, fontWeight: 700 }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                color: THEME.text,
                fontSize: { xs: 28, md: 32 },
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                mt: 1,
              }}
            >
              {value}
            </Typography>
            {subtitle ? (
              <Typography sx={{ color: THEME.subtext, fontSize: 12.5, mt: 1 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              width: { xs: 46, md: 46 },
              height: { xs: 46, md: 46 },
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
              boxShadow: `0 10px 24px ${accent}33`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function JobsSummaryCard({ openJobs, closedJobs, totalJobs }) {
  const items = [
    {
      label: "Open Jobs",
      value: openJobs,
      color: THEME.green,
      icon: <WorkHistoryRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Closed Jobs",
      value: closedJobs,
      color: THEME.pink,
      icon: <WorkOffRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Total Jobs",
      value: totalJobs,
      color: THEME.blue,
      icon: <WorkOutlineRoundedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <GlassCard
      sx={{
        height: "100%",
        background: `
          radial-gradient(circle at 88% 18%, rgba(34,197,94,0.12), transparent 20%),
          radial-gradient(circle at 12% 20%, rgba(59,130,246,0.10), transparent 22%),
          linear-gradient(180deg, rgba(10,16,28,0.82) 0%, rgba(10,16,28,0.68) 100%)
        `,
      }}
    >
      <CardContent sx={{ p: { xs: 1.8, sm: 2.1, md: 2.4 } }}>
        <Stack spacing={2}>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <WorkOutlineRoundedIcon
                sx={{ color: THEME.green, fontSize: 20 }}
              />
              <Typography
                sx={{ color: THEME.text, fontWeight: 800, fontSize: 15 }}
              >
                Jobs Overview
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={1.2}>
            {items.map((item) => (
              <Grid key={item.label} item xs={12} sm={4}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 1.6 },
                    borderRadius: 3,
                    border: `1px solid ${THEME.borderSoft}`,
                    background: "rgba(255,255,255,0.03)",
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: `${item.color}22`,
                        color: item.color,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{
                        color: THEME.subtext,
                        fontSize: 12.5,
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      color: THEME.text,
                      fontSize: { xs: 26, sm: 28, md: 30 },
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function StageBarChartCard({ segments }) {
  const maxValue = Math.max(...segments.map((x) => x.value), 1);

  return (
    <GlassCard
      sx={{
        height: "100%",
        minHeight: { xs: 390, md: 500 },
        background: `
          radial-gradient(circle at 12% 18%, rgba(6,182,212,0.10), transparent 22%),
          linear-gradient(180deg, rgba(10,16,28,0.82) 0%, rgba(10,16,28,0.68) 100%)
        `,
      }}
    >
      <CardContent sx={{ p: { xs: 1.8, sm: 2.1, md: 2.6 }, height: "100%" }}>
        <Stack sx={{ height: "100%" }} spacing={2.5}>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <BarChartRoundedIcon sx={{ color: THEME.cyan, fontSize: 20 }} />
              <Typography
                sx={{ color: THEME.text, fontWeight: 800, fontSize: 15 }}
              >
                Stage Comparison
              </Typography>
            </Stack>
            <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
              Internal recruitment statuses grouped into the main pipeline
              stages.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.4,
              borderRadius: 3,
              border: `1px solid ${THEME.borderSoft}`,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <Stack direction="row" flexWrap="wrap" gap={1.2}>
              {segments.map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography sx={{ color: THEME.subtext, fontSize: 12.2 }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="flex-end"
              justifyContent="space-between"
              sx={{
                width: "100%",
                minHeight: { xs: 230, md: 300 },
                overflowX: { xs: "auto", md: "visible" },
                pb: { xs: 1, md: 0 },
              }}
            >
              {segments.map((item) => {
                const height = `${Math.max((item.value / maxValue) * 235, item.value > 0 ? 22 : 8)}px`;
                return (
                  <Stack
                    key={item.label}
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <Typography
                      sx={{ color: THEME.text, fontSize: 13, fontWeight: 800 }}
                    >
                      {item.value}
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: { xs: 48, sm: 54, md: 86 },
                        height,
                        borderRadius: "16px 16px 8px 8px",
                        background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}cc 100%)`,
                        boxShadow: `0 12px 22px ${item.color}22`,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <Typography
                      sx={{
                        color: THEME.subtext,
                        fontSize: 11.5,
                        textAlign: "center",
                        lineHeight: 1.2,
                        minHeight: 28,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function VipVsNormalLineChartCard({ data, vipTotal, normalTotal }) {
  const width = 640;
  const height = 240;
  const paddingX = 26;
  const paddingY = 24;
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.vip, item.normal]),
    1,
  );
  const xStep =
    data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

  function getX(index) {
    return paddingX + index * xStep;
  }

  function getY(value) {
    const usableHeight = height - paddingY * 2;
    return height - paddingY - (value / maxValue) * usableHeight;
  }

  const vipPoints = data
    .map((item, index) => `${getX(index)},${getY(item.vip)}`)
    .join(" ");
  const normalPoints = data
    .map((item, index) => `${getX(index)},${getY(item.normal)}`)
    .join(" ");
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => paddingY + ratio * (height - paddingY * 2),
  );

  return (
    <GlassCard
      sx={{
        height: "100%",
        minHeight: { xs: 420, md: 500 },
        background: `
          radial-gradient(circle at 84% 18%, rgba(139,92,246,0.10), transparent 22%),
          linear-gradient(180deg, rgba(10,16,28,0.82) 0%, rgba(10,16,28,0.68) 100%)
        `,
      }}
    >
      <CardContent sx={{ p: { xs: 1.8, sm: 2.1, md: 2.6 }, height: "100%" }}>
        <Stack sx={{ height: "100%" }} spacing={2.5}>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <ShowChartRoundedIcon
                sx={{ color: THEME.purple, fontSize: 20 }}
              />
              <Typography
                sx={{ color: THEME.text, fontWeight: 800, fontSize: 15 }}
              >
                VIP vs Normal Candidates
              </Typography>
            </Stack>
            <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
              Monthly trend for the current year.
            </Typography>
          </Box>

          <Grid container spacing={1.2}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${THEME.borderSoft}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: THEME.purple,
                    }}
                  />
                  <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
                    VIP Total
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    color: THEME.text,
                    fontSize: 28,
                    fontWeight: 900,
                    mt: 1,
                  }}
                >
                  {vipTotal}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${THEME.borderSoft}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: THEME.cyan,
                    }}
                  />
                  <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
                    Normal Total
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    color: THEME.text,
                    fontSize: 28,
                    fontWeight: 900,
                    mt: 1,
                  }}
                >
                  {normalTotal}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: THEME.purple,
                }}
              />
              <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
                VIP
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: THEME.cyan,
                }}
              />
              <Typography sx={{ color: THEME.subtext, fontSize: 12.5 }}>
                Normal
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box sx={{ minWidth: { xs: 520, md: 620 } }}>
                <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
                  {gridLines.map((y, index) => (
                    <line
                      key={index}
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  <polyline
                    fill="none"
                    stroke={THEME.purple}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={vipPoints}
                  />

                  <polyline
                    fill="none"
                    stroke={THEME.cyan}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={normalPoints}
                  />

                  {data.map((item, index) => (
                    <circle
                      key={`vip-${item.label}`}
                      cx={getX(index)}
                      cy={getY(item.vip)}
                      r="5"
                      fill={THEME.purple}
                    />
                  ))}

                  {data.map((item, index) => (
                    <circle
                      key={`normal-${item.label}`}
                      cx={getX(index)}
                      cy={getY(item.normal)}
                      r="5"
                      fill={THEME.cyan}
                    />
                  ))}
                </svg>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mt: 1, px: 1 }}
                >
                  {data.map((item) => (
                    <Typography
                      key={item.label}
                      sx={{
                        color: THEME.subtext,
                        fontSize: 11.5,
                        width: 36,
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function getAdminDisplayName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
      user.full_name ||
      user.name ||
      user.username ||
      user.email?.split("@")?.[0] ||
      "Admin"
    );
  } catch {
    return "Admin";
  }
}

function getJobStatus(job) {
  const raw =
    job?.status ||
    job?.job_status ||
    job?.open_status ||
    job?.is_open ||
    job?.active;

  if (typeof raw === "boolean") return raw ? "open" : "closed";
  const value = String(raw || "")
    .toLowerCase()
    .trim();

  if (
    ["open", "active", "published", "live", "available", "ongoing"].includes(
      value,
    )
  )
    return "open";
  if (
    [
      "closed",
      "inactive",
      "archived",
      "filled",
      "expired",
      "draft",
      "paused",
    ].includes(value)
  )
    return "closed";

  return "open";
}

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyFilter, setMonthlyFilter] = useState("all");

  const adminName = getAdminDisplayName();
  const MONTH_OPTIONS = useMemo(() => getMonthOptions(), []);

  async function loadDashboard(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("token");

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const [candidatesRes, jobsRes, salesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/candidates`, {
          cache: "no-store",
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/admin/jobs`, {
          cache: "no-store",
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/api/admin/sales`, {
          cache: "no-store",
          headers: authHeaders,
        }),
      ]);

      if (candidatesRes.status === "fulfilled") {
        const res = candidatesRes.value;
        const data = await res.json().catch(() => ({}));
        setCandidates(
          res.ok && Array.isArray(data.candidates) ? data.candidates : [],
        );
      } else {
        setCandidates([]);
      }

      if (jobsRes.status === "fulfilled") {
        const res = jobsRes.value;
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (Array.isArray(data.jobs)) setJobs(data.jobs);
          else if (Array.isArray(data.data)) setJobs(data.data);
          else if (Array.isArray(data)) setJobs(data);
          else setJobs([]);
        } else {
          setJobs([]);
        }
      } else {
        setJobs([]);
      }

      if (salesRes.status === "fulfilled") {
        const res = salesRes.value;
        const data = await res.json().catch(() => []);
        if (res.ok) {
          if (Array.isArray(data)) setSales(data);
          else if (Array.isArray(data.sales)) setSales(data.sales);
          else if (Array.isArray(data.data)) setSales(data.data);
          else setSales([]);
        } else {
          setSales([]);
        }
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setCandidates([]);
      setJobs([]);
      setSales([]);
    } finally {
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard(true);
    const interval = setInterval(() => loadDashboard(false), 8000);
    return () => clearInterval(interval);
  }, []);

  const dashboardData = useMemo(() => {
    const totalCandidates = candidates.length;
    const totalJobsPosted = jobs.length;
    const openJobs = jobs.filter((job) => getJobStatus(job) === "open").length;
    const closedJobs = jobs.filter(
      (job) => getJobStatus(job) === "closed",
    ).length;

    const filteredCandidates = candidates.filter((candidate) =>
      isDateInSelectedFilter(
        candidate?.recruitment_updated_at ||
          candidate?.date ||
          candidate?.created_at,
        monthlyFilter,
      ),
    );
    const filteredSales = sales.filter((sale) =>
      isDateInSelectedFilter(sale?.sale_date, monthlyFilter),
    );

    let totalSalesGenerated = 0;
    let applied = 0;
    let interviewed = 0;
    let offer = 0;
    let hired = 0;
    let rejected = 0;
    let waitlist = 0;

    filteredSales.forEach((sale) => {
      totalSalesGenerated += getNumericValue(sale, [
        "sales_amount",
        "sale_amount",
      ]);
    });

    filteredCandidates.forEach((candidate) => {
      const status = normalizeStage(getCandidateStatus(candidate));
      if (status === "Applied") applied += 1;
      else if (status === "Interviewed") interviewed += 1;
      else if (status === "Offer") offer += 1;
      else if (status === "Hired") hired += 1;
      else if (status === "Rejected") rejected += 1;
      else if (status === "Waitlist") waitlist += 1;
    });

    const stageSegments = [
      { label: "Applied", value: applied, color: THEME.blue },
      { label: "Interviewed", value: interviewed, color: THEME.amber },
      { label: "Offer", value: offer, color: THEME.purple },
      { label: "Hired", value: hired, color: THEME.green },
      { label: "Rejected", value: rejected, color: THEME.pink },
      { label: "Waitlist", value: waitlist, color: THEME.slate },
    ];

    const currentYear = new Date().getFullYear();
    const vipVsNormalByMonth = Array.from({ length: 12 }, (_, index) => ({
      label: new Date(currentYear, index, 1).toLocaleString("en-US", {
        month: "short",
      }),
      vip: 0,
      normal: 0,
    }));

    let vipTotal = 0;
    let normalTotal = 0;

    candidates.forEach((candidate) => {
      const date = getValidDate(candidate?.date);
      if (!date) return;
      if (date.getFullYear() !== currentYear) return;
      const monthIndex = date.getMonth();
      if (isVipCandidate(candidate)) {
        vipVsNormalByMonth[monthIndex].vip += 1;
        vipTotal += 1;
      } else {
        vipVsNormalByMonth[monthIndex].normal += 1;
        normalTotal += 1;
      }
    });

    return {
      totalCandidates,
      totalJobsPosted,
      openJobs,
      closedJobs,
      totalSalesGenerated,
      stageSegments,
      vipVsNormalByMonth,
      vipTotal,
      normalTotal,
    };
  }, [candidates, jobs, sales, monthlyFilter]);

  if (loading) {
    return (
      <AdminLayout>
        <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress sx={{ color: THEME.blue }} />
            <Typography sx={{ color: THEME.text }}>
              Loading dashboard...
            </Typography>
          </Stack>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: "100%",
          px: { xs: 1, sm: 1.5, md: 0 },
          py: { xs: 1, md: 1 },
          pb: { xs: 1, md: 0 },
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <GlassCard
            sx={{
              background: `
                radial-gradient(circle at 12% 20%, rgba(59,130,246,0.16), transparent 24%),
                radial-gradient(circle at 88% 18%, rgba(139,92,246,0.14), transparent 22%),
                linear-gradient(135deg, rgba(10,16,28,0.90) 0%, rgba(10,16,28,0.74) 100%)
              `,
            }}
          >
            <CardContent sx={{ p: { xs: 1.8, sm: 2.1, md: 3 } }}>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", lg: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography
                    sx={{
                      color: THEME.text,
                      fontWeight: 900,
                      fontSize: { xs: 24, sm: 30, md: 38 },
                      letterSpacing: "-0.06em",
                      lineHeight: 1,
                    }}
                  >
                    {`Welcome ${adminName}`}
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  sx={{ width: { xs: "100%", lg: "auto" } }}
                >
                  <TextField
                    select
                    size="small"
                    value={monthlyFilter}
                    onChange={(e) => setMonthlyFilter(e.target.value)}
                    sx={{
                      minWidth: { xs: "100%", sm: 210 },
                      "& .MuiOutlinedInput-root": {
                        color: THEME.text,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        height: 44,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: THEME.border,
                      },
                      "& .MuiSvgIcon-root": {
                        color: THEME.text,
                      },
                    }}
                  >
                    {MONTH_OPTIONS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    startIcon={<RefreshRoundedIcon />}
                    onClick={() => loadDashboard(false)}
                    variant="outlined"
                    sx={{
                      color: THEME.text,
                      borderColor: THEME.border,
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      height: 44,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.18)",
                        backgroundColor: "rgba(255,255,255,0.07)",
                      },
                    }}
                  >
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </GlassCard>

          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.25 }}>
            <Grid item xs={12} md={4}>
              <MiniStatCard
                title="Total Candidates"
                value={dashboardData.totalCandidates}
                icon={<GroupsRoundedIcon sx={{ fontSize: 20 }} />}
                accent={THEME.blue}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MiniStatCard
                title="Total Sales Generated"
                value={formatCompact(dashboardData.totalSalesGenerated)}
                icon={<PaidRoundedIcon sx={{ fontSize: 20 }} />}
                accent={THEME.amber}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <JobsSummaryCard
                openJobs={dashboardData.openJobs}
                closedJobs={dashboardData.closedJobs}
                totalJobs={dashboardData.totalJobsPosted}
              />
            </Grid>

            <Grid item xs={12} xl={6}>
              <VipVsNormalLineChartCard
                data={dashboardData.vipVsNormalByMonth}
                vipTotal={dashboardData.vipTotal}
                normalTotal={dashboardData.normalTotal}
              />
            </Grid>

            <Grid item xs={12} xl={6}>
              <StageBarChartCard segments={dashboardData.stageSegments} />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </AdminLayout>
  );
}
