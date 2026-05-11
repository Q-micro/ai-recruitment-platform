/**
 * The `AdminCompanies` function in this React component manages the display and interaction with a
 * list of companies, allowing for filtering, sorting, and updating company statuses.
 */
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

const API_BASE_URL = "http://localhost:3001";

const STATUS_STYLES = {
  approved: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.16)",
    border: "rgba(52,211,153,0.28)",
  },
  rejected: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.16)",
    border: "rgba(248,113,113,0.28)",
  },
  pending: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.16)",
    border: "rgba(251,191,36,0.28)",
  },
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  const rowsPerPage = 10;

  useEffect(() => {
    loadCompanies();
  }, []);

  function showMessage(type, text) {
    setMessageType(type);
    setMessageText(text);
    setMessageOpen(true);
  }

  async function loadCompanies(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/admin/companies`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch companies");
      }

      setCompanies(Array.isArray(data.companies) ? data.companies : []);
    } catch (err) {
      console.error(err);
      setCompanies([]);
      showMessage("error", err.message || "Failed to fetch companies.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  function requestCompanyStatusUpdate(company, status) {
    if (!company?.id) return;

    setPendingAction({ company, status });
    setConfirmOpen(true);
  }

  async function updateCompanyStatus() {
    if (!pendingAction?.company?.id || !pendingAction?.status) return;

    const { company, status } = pendingAction;

    try {
      setUpdatingId(company.id);
      setConfirmOpen(false);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/admin/companies/${company.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update company status");
      }

      await loadCompanies(false);

      if (selectedCompany?.id === company.id) {
        setSelectedCompany(data.company || null);
      }

      showMessage(
        "success",
        `Company ${status === "approved" ? "approved" : "rejected"} successfully.`,
      );
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Failed to update company status.");
    } finally {
      setUpdatingId(null);
      setPendingAction(null);
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  const filteredCompanies = useMemo(() => {
    let rows = [...companies];

    if (search.trim()) {
      const q = search.toLowerCase();

      rows = rows.filter((company) =>
        [
          company.name,
          company.industry,
          company.location,
          company.email,
          company.phone,
          company.website,
          company.cr_number,
          company.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      );
    }

    if (tab !== "all") {
      rows = rows.filter(
        (company) => String(company.status || "").toLowerCase() === tab,
      );
    }

    if (sortBy === "a-z") {
      rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "z-a") {
      rows.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortBy === "oldest") {
      rows.sort(
        (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      );
    } else {
      rows.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    }

    return rows;
  }, [companies, search, tab, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / rowsPerPage),
  );

  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  useEffect(() => {
    setPage(1);
  }, [search, tab, sortBy]);

  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const tabButtons = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  function openDetails(company) {
    setSelectedCompany(company);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedCompany(null);
    setDetailsOpen(false);
  }

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 30%), #071120",
          p: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 5,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,15,28,0.98) 100%)",
              border: "1px solid rgba(148,163,184,0.10)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", xl: "center" }}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Companies
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.65)", mt: 0.75 }}>
                  Review employer company registrations
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <TextField
                  placeholder="Search company, CR, industry, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={darkFieldSx(320)}
                />

                <TextField
                  select
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={darkFieldSx(150)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="a-z">A-Z</MenuItem>
                  <MenuItem value="z-a">Z-A</MenuItem>
                </TextField>

                <Button
                  onClick={() => loadCompanies()}
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                  sx={topActionBtnSx}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {tabButtons.map((item) => {
                  const active = tab === item.value;

                  return (
                    <Button
                      key={item.value}
                      onClick={() => setTab(item.value)}
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        px: 2,
                        py: 1,
                        fontWeight: 700,
                        color: active ? "#fff" : "rgba(255,255,255,0.78)",
                        background: active
                          ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                          : "rgba(255,255,255,0.04)",
                        border: active
                          ? "1px solid rgba(59,130,246,0.45)"
                          : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: active
                          ? "0 10px 25px rgba(37,99,235,0.25)"
                          : "none",
                        "&:hover": {
                          background: active
                            ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
                            : "rgba(255,255,255,0.07)",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>

              <Chip
                label={`Total companies: ${filteredCompanies.length}`}
                sx={{
                  alignSelf: { xs: "flex-start", md: "center" },
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              />
            </Stack>

            <TableContainer
              component={Box}
              sx={{
                background: "transparent",
                overflow: "auto",
                border: "none",
              }}
            >
              <Table sx={{ minWidth: 1200, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headCellSx, width: "22%" }}>
                      Company
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "12%" }}>
                      CR Number
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "13%" }}>
                      Industry
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "13%" }}>
                      Location
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "16%" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ ...headCellSx, width: "10%" }}>
                      Joined
                    </TableCell>
                    <TableCell
                      sx={{ ...headCellSx, width: "14%" }}
                      align="right"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{
                          color: "#94a3b8",
                          textAlign: "center",
                          py: 6,
                          borderBottom: "none",
                        }}
                      >
                        {loading ? "Loading..." : "No companies found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCompanies.map((company, index) => {
                      const status = (
                        company.status || "pending"
                      ).toLowerCase();
                      const statusStyle =
                        STATUS_STYLES[status] || STATUS_STYLES.pending;

                      return (
                        <TableRow
                          key={`${company.id || company.name || "company"}-${index}`}
                          sx={{
                            transition: "all 0.18s ease",
                            "& td": {
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            },
                            "&:nth-of-type(even)": {
                              backgroundColor: "rgba(255,255,255,0.015)",
                            },
                            "&:hover": {
                              backgroundColor: "rgba(59,130,246,0.07)",
                            },
                          }}
                        >
                          <TableCell sx={bodyCellSx}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background:
                                    "linear-gradient(135deg, rgba(37,99,235,0.85), rgba(99,102,241,0.85))",
                                  color: "#fff",
                                  flexShrink: 0,
                                }}
                              >
                                <BusinessRoundedIcon />
                              </Box>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  onClick={() => openDetails(company)}
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    color: "#e2e8f0",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textDecoration: "underline",
                                    textDecorationColor:
                                      "rgba(96,165,250,0.35)",
                                    textUnderlineOffset: "3px",
                                    "&:hover": {
                                      color: "#60a5fa",
                                      textDecorationColor: "#60a5fa",
                                    },
                                  }}
                                >
                                  {company.name || "-"}
                                </Typography>

                                <Typography sx={smallMutedTextSx}>
                                  {company.website || "No website"}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Typography sx={truncateTextSx}>
                              {company.cr_number || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Typography sx={truncateTextSx}>
                              {company.industry || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Typography sx={truncateTextSx}>
                              {company.location || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Typography sx={truncateTextSx}>
                              {company.email || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Chip
                              label={status}
                              size="small"
                              sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                color: statusStyle.color,
                                backgroundColor: statusStyle.bg,
                                border: `1px solid ${statusStyle.border}`,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>

                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ whiteSpace: "nowrap" }}>
                              {formatDate(company.created_at)}
                            </Typography>
                          </TableCell>

                          <TableCell align="right" sx={bodyCellSx}>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Approve">
                                <span>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      ...actionIconBtnSx,
                                      color: "#34d399",
                                    }}
                                    disabled={
                                      updatingId === company.id ||
                                      company.status === "approved"
                                    }
                                    onClick={() =>
                                      requestCompanyStatusUpdate(
                                        company,
                                        "approved",
                                      )
                                    }
                                  >
                                    <CheckCircleRoundedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Reject">
                                <span>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      ...actionIconBtnSx,
                                      color: "#f87171",
                                    }}
                                    disabled={
                                      updatingId === company.id ||
                                      company.status === "rejected"
                                    }
                                    onClick={() =>
                                      requestCompanyStatusUpdate(
                                        company,
                                        "rejected",
                                      )
                                    }
                                  >
                                    <CancelRoundedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ mt: 2.5, gap: 2 }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>
                Showing{" "}
                {filteredCompanies.length === 0
                  ? 0
                  : (page - 1) * rowsPerPage + 1}
                -{Math.min(page * rowsPerPage, filteredCompanies.length)} of{" "}
                {filteredCompanies.length}
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="outlined"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  sx={pagerBtnSx}
                >
                  First
                </Button>

                <Button
                  variant="outlined"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  sx={pagerBtnSx}
                >
                  <KeyboardArrowLeftRoundedIcon />
                </Button>

                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="contained"
                    onClick={() => setPage(pageNumber)}
                    sx={{
                      ...pagerBtnSx,
                      minWidth: 42,
                      background:
                        page === pageNumber
                          ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                          : "rgba(255,255,255,0.04)",
                      color: "#fff",
                      border:
                        page === pageNumber
                          ? "1px solid rgba(59,130,246,0.38)"
                          : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  variant="outlined"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  sx={pagerBtnSx}
                >
                  <KeyboardArrowRightRoundedIcon />
                </Button>

                <Button
                  variant="outlined"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  sx={pagerBtnSx}
                >
                  Last
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
              {selectedCompany?.name || "Company Details"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", mt: 0.4 }}>
              Employer submitted company information
            </Typography>
          </Box>

          <IconButton onClick={closeDetails} sx={{ color: "#fff" }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, px: 0 }}>
          {selectedCompany && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Box
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <SimpleDetailItem
                  label="Company Name"
                  value={selectedCompany.name}
                />
                <SimpleDetailItem
                  label="CR Number"
                  value={selectedCompany.cr_number}
                />
                <SimpleDetailItem
                  label="Industry"
                  value={selectedCompany.industry}
                />
                <SimpleDetailItem
                  label="Website"
                  value={selectedCompany.website}
                />
                <SimpleDetailItem label="Email" value={selectedCompany.email} />
                <SimpleDetailItem label="Phone" value={selectedCompany.phone} />
                <SimpleDetailItem
                  label="Location"
                  value={selectedCompany.location}
                />
                <SimpleDetailItem
                  label="Status"
                  value={selectedCompany.status}
                  isStatus
                />
                <SimpleDetailItem
                  label="Visible"
                  value={selectedCompany.is_visible ? "Yes" : "No"}
                />
                <SimpleDetailItem
                  label="Created By User ID"
                  value={String(selectedCompany.created_by_user_id || "-")}
                />
                <SimpleDetailItem
                  label="Created At"
                  value={formatDate(selectedCompany.created_at)}
                />
                <SimpleDetailItem
                  label="Description"
                  value={selectedCompany.description}
                  noBorder
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          {selectedCompany && (
            <>
              <Button
                onClick={() =>
                  requestCompanyStatusUpdate(selectedCompany, "approved")
                }
                variant="contained"
                disabled={
                  updatingId === selectedCompany.id ||
                  selectedCompany.status === "approved"
                }
                sx={primaryBtnSx}
              >
                Approve
              </Button>

              <Button
                onClick={() =>
                  requestCompanyStatusUpdate(selectedCompany, "rejected")
                }
                variant="outlined"
                disabled={
                  updatingId === selectedCompany.id ||
                  selectedCompany.status === "rejected"
                }
                sx={dangerBtnSx}
              >
                Reject
              </Button>

              <Button
                onClick={closeDetails}
                variant="outlined"
                sx={secondaryBtnSx}
              >
                Close
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (updatingId) return;
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Confirm Company Status
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
            Are you sure you want to {pendingAction?.status}{" "}
            <strong>{pendingAction?.company?.name || "this company"}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button
            variant="outlined"
            sx={secondaryBtnSx}
            disabled={Boolean(updatingId)}
            onClick={() => {
              setConfirmOpen(false);
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={
              pendingAction?.status === "approved"
                ? primaryBtnSx
                : dangerSolidBtnSx
            }
            disabled={Boolean(updatingId)}
            onClick={updateCompanyStatus}
          >
            {updatingId ? "Updating..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {messageType === "success" ? "Success" : "Something went wrong"}
        </DialogTitle>
        <DialogContent>
          <Alert severity={messageType} sx={{ borderRadius: 2 }}>
            {messageText}
          </Alert>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button
            variant="contained"
            sx={primaryBlueBtnSx}
            onClick={() => setMessageOpen(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

function SimpleDetailItem({
  label,
  value,
  isStatus = false,
  noBorder = false,
}) {
  const statusStyle = STATUS_STYLES[String(value || "").toLowerCase()] || {
    color: "#cbd5e1",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.10)",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.2,
        py: 1.8,
        px: 0.5,
        borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography
        sx={{
          minWidth: { sm: 180 },
          color: "rgba(255,255,255,0.52)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>

      {isStatus ? (
        <Chip
          label={value || "-"}
          size="small"
          sx={{
            borderRadius: 999,
            fontWeight: 700,
            color: statusStyle.color,
            backgroundColor: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            textTransform: "capitalize",
          }}
        />
      ) : (
        <Typography
          sx={{
            flex: 1,
            textAlign: { xs: "left", sm: "right" },
            color: "#f8fafc",
            fontSize: 14.5,
            fontWeight: 500,
            wordBreak: "break-word",
          }}
        >
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}

const headCellSx = {
  color: "#94a3b8",
  fontWeight: 800,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  color: "#dbe7ff",
  verticalAlign: "middle",
  py: 1.6,
};

const smallMutedTextSx = {
  color: "#8fa2c4",
  fontSize: 12.5,
  mt: 0.25,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const truncateTextSx = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const pagerBtnSx = {
  minWidth: 42,
  color: "#fff",
  borderColor: "rgba(255,255,255,0.10)",
  borderRadius: 2.5,
  textTransform: "none",
};

function darkFieldSx(minWidth) {
  return {
    minWidth,
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      borderRadius: 3,
      backgroundColor: "rgba(15,23,42,0.85)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.08)",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
    "& .MuiSvgIcon-root": {
      color: "#fff",
    },
  };
}

const topActionBtnSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.12)",
  borderRadius: 3,
  px: 1.6,
  textTransform: "none",
  fontWeight: 700,
  backgroundColor: "rgba(255,255,255,0.03)",
};

const actionIconBtnSx = {
  color: "#dbeafe",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const dialogPaperSx = {
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
  color: "#fff",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
};

const dialogActionsSx = {
  p: 2,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const primaryBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
};

const primaryBlueBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
};

const secondaryBtnSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.16)",
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 700,
};

const dangerBtnSx = {
  color: "#f87171",
  borderColor: "rgba(248,113,113,0.32)",
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 700,
};

const dangerSolidBtnSx = {
  textTransform: "none",
  fontWeight: 800,
  borderRadius: 3,
  px: 2,
  color: "#fff",
  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
};
