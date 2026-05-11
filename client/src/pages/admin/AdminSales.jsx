/**
 * The `AdminSales` function in this code snippet is a React component that manages sales data for an
 * admin dashboard, allowing users to view, add, edit, and delete sales records with various filtering
 * and sorting options.
 */
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { styled } from "@mui/material/styles";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  DollarSign,
  Users,
  Wallet,
  TrendingUp,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

const glassCardSx = {
  borderRadius: 3,
  bgcolor: "rgba(15, 23, 42, 0.45)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
};

const dialogPaperSx = {
  ...glassCardSx,
  color: "#f8fafc",
  bgcolor: "rgba(15, 23, 42, 0.96)",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(9,13,25,0.98) 100%)",
};

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(2, 6, 23, 0.45)",
    color: "#9ca3af",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  [`&.${tableCellClasses.body}`]: {
    color: "#e5e7eb",
    fontSize: 13,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

function SummaryCard({ title, value, subtitle, icon, accent }) {
  const Icon = icon;

  return (
    <Card
      elevation={0}
      sx={{
        ...glassCardSx,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "#f8fafc", fontWeight: 700, mt: 0.5 }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${accent}22`,
              color: accent,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Icon size={20} />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: 12 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

const NEW_AGENT_OPTION = "__new_agent__";

const initialForm = {
  sale_date: "",
  sales_amount: "",
  signups: "",
  expenses: "",
  refunds: "",
  description: "",
  sales_agent: "",
};

function normalizeAgent(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function cleanAgentName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [agentSelectValue, setAgentSelectValue] = useState("");
  const [newAgentName, setNewAgentName] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");

  const formatBD = (value) => `${Number(value || 0).toFixed(2)} BD`;

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).split("T")[0];
    }
    return date.toISOString().split("T")[0];
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/admin/sales`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Sales response is not an array");
      }

      setSales(data);
    } catch (err) {
      console.error("loadSales error:", err);
      setError(err.message || "Something went wrong");
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const salesAgents = useMemo(() => {
    const map = new Map();

    sales.forEach((row) => {
      const cleaned = cleanAgentName(row.sales_agent);
      const normalized = normalizeAgent(cleaned);

      if (normalized && !map.has(normalized)) {
        map.set(normalized, cleaned);
      }
    });

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [sales]);

  const resolvedAgentName =
    agentSelectValue === NEW_AGENT_OPTION
      ? cleanAgentName(newAgentName)
      : cleanAgentName(agentSelectValue || form.sales_agent);

  const filteredSales = useMemo(() => {
    let rows = [...sales];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => {
        return (
          String(row.description || "")
            .toLowerCase()
            .includes(q) ||
          String(row.sales_agent || "")
            .toLowerCase()
            .includes(q) ||
          String(row.sale_date || "")
            .toLowerCase()
            .includes(q) ||
          String(row.sales_amount || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }

    if (agentFilter !== "all") {
      rows = rows.filter(
        (row) =>
          normalizeAgent(row.sales_agent) === normalizeAgent(agentFilter),
      );
    }

    if (fromDate) {
      rows = rows.filter((row) => formatDateOnly(row.sale_date) >= fromDate);
    }

    if (toDate) {
      rows = rows.filter((row) => formatDateOnly(row.sale_date) <= toDate);
    }

    rows.sort((a, b) => {
      const dateA = new Date(a.sale_date).getTime();
      const dateB = new Date(b.sale_date).getTime();
      const amountA = Number(a.sales_amount || 0);
      const amountB = Number(b.sales_amount || 0);

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;
        case "newest":
          return dateB - dateA;
        case "sales_high":
          return amountB - amountA;
        case "sales_low":
          return amountA - amountB;
        default:
          return dateB - dateA;
      }
    });

    return rows;
  }, [sales, search, sortBy, fromDate, toDate, agentFilter]);

  const summary = useMemo(() => {
    return filteredSales.reduce(
      (acc, row) => {
        acc.totalSales += Number(row.sales_amount || 0);
        acc.totalSignups += Number(row.signups || 0);
        acc.totalExpenses += Number(row.expenses || 0);
        acc.totalRefunds += Number(row.refunds || 0);
        acc.totalProfit += Number(row.gross_profit || 0);
        return acc;
      },
      {
        totalSales: 0,
        totalSignups: 0,
        totalExpenses: 0,
        totalRefunds: 0,
        totalProfit: 0,
      },
    );
  }, [filteredSales]);

  const getProfitColor = (profit) => {
    const value = Number(profit || 0);
    if (value > 0) return "success";
    if (value < 0) return "error";
    return "default";
  };

  const resetAgentFields = (agent = "") => {
    const cleaned = cleanAgentName(agent);

    if (!cleaned) {
      setAgentSelectValue("");
      setNewAgentName("");
      return;
    }

    const exists = salesAgents.some(
      (item) => normalizeAgent(item) === normalizeAgent(cleaned),
    );

    if (exists) {
      const matched = salesAgents.find(
        (item) => normalizeAgent(item) === normalizeAgent(cleaned),
      );
      setAgentSelectValue(matched || cleaned);
      setNewAgentName("");
    } else {
      setAgentSelectValue(NEW_AGENT_OPTION);
      setNewAgentName(cleaned);
    }
  };

  const handleOpenAddDialog = () => {
    setSaveError("");
    setEditingId(null);
    setForm({
      ...initialForm,
      sale_date: new Date().toISOString().split("T")[0],
    });
    resetAgentFields("");
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    if (saving) return;
    setOpenAddDialog(false);
    setSaveError("");
    setForm(initialForm);
    resetAgentFields("");
  };

  const handleOpenEditDialog = (row) => {
    setSaveError("");
    setEditingId(row.id);
    setForm({
      sale_date: formatDateOnly(row.sale_date),
      sales_amount: String(row.sales_amount ?? ""),
      signups: String(row.signups ?? ""),
      expenses: String(row.expenses ?? ""),
      refunds: String(row.refunds ?? ""),
      description: row.description || "",
      sales_agent: cleanAgentName(row.sales_agent || ""),
    });
    resetAgentFields(row.sales_agent || "");
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    if (saving) return;
    setOpenEditDialog(false);
    setSaveError("");
    setForm(initialForm);
    setEditingId(null);
    resetAgentFields("");
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAgentSelectChange = (event) => {
    const value = event.target.value;
    setAgentSelectValue(value);

    if (value === NEW_AGENT_OPTION) {
      setForm((prev) => ({
        ...prev,
        sales_agent: "",
      }));
      return;
    }

    setNewAgentName("");
    setForm((prev) => ({
      ...prev,
      sales_agent: cleanAgentName(value),
    }));
  };

  const handleNewAgentNameChange = (event) => {
    const value = event.target.value;
    setNewAgentName(value);
    setForm((prev) => ({
      ...prev,
      sales_agent: cleanAgentName(value),
    }));
  };

  const buildPayload = () => {
    const finalAgent = resolvedAgentName;

    if (!form.sale_date) {
      throw new Error("Sale date is required");
    }

    if (form.sales_amount === "" || Number(form.sales_amount) < 0) {
      throw new Error("Sales amount must be 0 or more");
    }

    if (!finalAgent) {
      throw new Error("Sales agent is required");
    }

    return {
      sale_date: form.sale_date,
      sales_amount: Number(form.sales_amount || 0),
      signups: Number(form.signups || 0),
      expenses: Number(form.expenses || 0),
      refunds: Number(form.refunds || 0),
      description: form.description.trim(),
      sales_agent: finalAgent,
    };
  };

  const handleAddSale = async () => {
    try {
      setSaving(true);
      setSaveError("");

      const payload = buildPayload();
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/admin/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || `Failed to save sale (${response.status})`,
        );
      }

      handleCloseAddDialog();
      await loadSales();
    } catch (err) {
      console.error("handleAddSale error:", err);
      setSaveError(err.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSale = async () => {
    try {
      setSaving(true);
      setSaveError("");

      if (!editingId) {
        throw new Error("Missing sale ID");
      }

      const payload = buildPayload();
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/sales/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || `Failed to update sale (${response.status})`,
        );
      }

      handleCloseEditDialog();
      await loadSales();
    } catch (err) {
      console.error("handleEditSale error:", err);
      setSaveError(err.message || "Failed to update sale");
    } finally {
      setSaving(false);
    }
  };

  function requestDeleteSale(row) {
    setSaleToDelete(row);
    setDeleteConfirmOpen(true);
  }

  const handleDeleteSale = async () => {
    if (!saleToDelete?.id) return;

    try {
      setDeletingId(saleToDelete.id);
      setDeleteError("");
      setDeleteConfirmOpen(false);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/sales/${saleToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || `Failed to delete sale (${response.status})`,
        );
      }

      await loadSales();
    } catch (err) {
      console.error("handleDeleteSale error:", err);
      setDeleteError(err.message || "Failed to delete sale");
    } finally {
      setDeletingId(null);
      setSaleToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("newest");
    setFromDate("");
    setToDate("");
    setAgentFilter("all");
  };

  const renderAgentFields = () => (
    <>
      <TextField
        select
        label="Sales agent"
        value={agentSelectValue}
        onChange={handleAgentSelectChange}
        fullWidth
        required
      >
        <MenuItem value="" disabled>
          Select agent
        </MenuItem>

        {salesAgents.map((agent) => (
          <MenuItem key={agent} value={agent}>
            {agent}
          </MenuItem>
        ))}

        <MenuItem value={NEW_AGENT_OPTION}>+ Add new agent</MenuItem>
      </TextField>

      {agentSelectValue === NEW_AGENT_OPTION && (
        <TextField
          label="New agent name"
          value={newAgentName}
          onChange={handleNewAgentNameChange}
          fullWidth
          required
        />
      )}
    </>
  );

  return (
    <AdminLayout title="Sales">
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at top right, rgba(168,85,247,0.10), transparent 28%)",
          p: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  mb: 0.5,
                }}
              >
                Sales overview
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Track daily sales, refunds, expenses, and profit.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={handleOpenAddDialog}
                startIcon={<Plus size={16} />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#2563eb",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                  },
                }}
              >
                Add Sale
              </Button>

              <Button
                variant="outlined"
                onClick={loadSales}
                startIcon={<RefreshCw size={16} />}
                sx={{
                  color: "#e5e7eb",
                  borderColor: "rgba(255,255,255,0.16)",
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              mb: 3,
              p: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Search"
                  placeholder="Agent, description, date, amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="newest">Newest first</MenuItem>
                  <MenuItem value="oldest">Oldest first</MenuItem>
                  <MenuItem value="sales_high">Highest sales</MenuItem>
                  <MenuItem value="sales_low">Lowest sales</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Agent"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">All agents</MenuItem>
                  {salesAgents.map((agent) => (
                    <MenuItem key={agent} value={agent}>
                      {agent}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  onClick={clearFilters}
                  fullWidth
                  variant="outlined"
                  sx={{
                    height: "56px",
                    color: "#e5e7eb",
                    borderColor: "rgba(255,255,255,0.16)",
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loading && (
            <Paper
              elevation={0}
              sx={{
                ...glassCardSx,
                p: 3,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress size={22} />
              <Typography sx={{ color: "#e5e7eb" }}>
                Loading sales data...
              </Typography>
            </Paper>
          )}

          {!!error && !loading && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {!!deleteError && !loading && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {deleteError}
            </Alert>
          )}

          {!loading && !error && (
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <SummaryCard
                  title="Total sales"
                  value={formatBD(summary.totalSales)}
                  subtitle="Based on current filters"
                  icon={DollarSign}
                  accent="#22c55e"
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <SummaryCard
                  title="Signups"
                  value={summary.totalSignups}
                  subtitle="Based on current filters"
                  icon={Users}
                  accent="#3b82f6"
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <SummaryCard
                  title="Expenses"
                  value={formatBD(summary.totalExpenses)}
                  subtitle="Based on current filters"
                  icon={Wallet}
                  accent="#f97316"
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <SummaryCard
                  title="Gross profit"
                  value={formatBD(summary.totalProfit)}
                  subtitle="Based on current filters"
                  icon={TrendingUp}
                  accent="#8b5cf6"
                />
              </Grid>
            </Grid>
          )}

          <Paper
            elevation={0}
            sx={{
              ...glassCardSx,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#e5e7eb", fontWeight: 600 }}
                >
                  Daily sales
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                  Showing {filteredSales.length} of {sales.length} records
                </Typography>
              </Box>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell align="right">Sales</StyledTableCell>
                    <StyledTableCell align="right">Signups</StyledTableCell>
                    <StyledTableCell align="right">Expenses</StyledTableCell>
                    <StyledTableCell align="right">Refunds</StyledTableCell>
                    <StyledTableCell align="right">
                      Gross profit
                    </StyledTableCell>
                    <StyledTableCell>Sales agent</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!loading && filteredSales.length === 0 ? (
                    <StyledTableRow>
                      <StyledTableCell
                        colSpan={9}
                        align="center"
                        sx={{ color: "#94a3b8" }}
                      >
                        No sales data found for the selected filters.
                      </StyledTableCell>
                    </StyledTableRow>
                  ) : (
                    filteredSales.map((row) => (
                      <StyledTableRow key={row.id}>
                        <StyledTableCell>
                          {formatDateOnly(row.sale_date)}
                        </StyledTableCell>

                        <StyledTableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatBD(row.sales_amount)}
                        </StyledTableCell>

                        <StyledTableCell align="right">
                          {Number(row.signups || 0)}
                        </StyledTableCell>

                        <StyledTableCell align="right">
                          {formatBD(row.expenses)}
                        </StyledTableCell>

                        <StyledTableCell align="right">
                          {formatBD(row.refunds)}
                        </StyledTableCell>

                        <StyledTableCell align="right">
                          <Chip
                            label={formatBD(row.gross_profit)}
                            color={getProfitColor(row.gross_profit)}
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 100, fontWeight: 600 }}
                          />
                        </StyledTableCell>

                        <StyledTableCell>
                          {cleanAgentName(row.sales_agent) || "-"}
                        </StyledTableCell>

                        <StyledTableCell>
                          {row.description || "-"}
                        </StyledTableCell>

                        <StyledTableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => handleOpenEditDialog(row)}
                              sx={{
                                color: "#cbd5e1",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 2,
                              }}
                            >
                              <Pencil size={16} />
                            </IconButton>

                            <IconButton
                              onClick={() => requestDeleteSale(row)}
                              disabled={deletingId === row.id}
                              sx={{
                                color: "#fda4af",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 2,
                              }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: dialogPaperSx }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Add new sale</DialogTitle>

          <DialogContent
            dividers
            sx={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Stack spacing={2} sx={{ mt: 1 }}>
              {!!saveError && <Alert severity="error">{saveError}</Alert>}

              <TextField
                label="Sale date"
                type="date"
                value={form.sale_date}
                onChange={handleChange("sale_date")}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />

              <TextField
                label="Sales amount"
                type="number"
                value={form.sales_amount}
                onChange={handleChange("sales_amount")}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.001" }}
              />

              <TextField
                label="Signups"
                type="number"
                value={form.signups}
                onChange={handleChange("signups")}
                fullWidth
                inputProps={{ min: 0, step: 1 }}
              />

              <TextField
                label="Expenses"
                type="number"
                value={form.expenses}
                onChange={handleChange("expenses")}
                fullWidth
                inputProps={{ min: 0, step: "0.001" }}
              />

              <TextField
                label="Refunds"
                type="number"
                value={form.refunds}
                onChange={handleChange("refunds")}
                fullWidth
                inputProps={{ min: 0, step: "0.001" }}
              />

              {renderAgentFields()}

              <TextField
                label="Description"
                value={form.description}
                onChange={handleChange("description")}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseAddDialog}
              disabled={saving}
              sx={{ textTransform: "none", color: "#cbd5e1" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSale}
              disabled={saving}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#2563eb",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                },
              }}
            >
              {saving ? "Saving..." : "Save sale"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: dialogPaperSx }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Edit sale</DialogTitle>

          <DialogContent
            dividers
            sx={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Stack spacing={2} sx={{ mt: 1 }}>
              {!!saveError && <Alert severity="error">{saveError}</Alert>}

              <TextField
                label="Sale date"
                type="date"
                value={form.sale_date}
                onChange={handleChange("sale_date")}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />

              <TextField
                label="Sales amount"
                type="number"
                value={form.sales_amount}
                onChange={handleChange("sales_amount")}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.001" }}
              />

              <TextField
                label="Signups"
                type="number"
                value={form.signups}
                onChange={handleChange("signups")}
                fullWidth
                inputProps={{ min: 0, step: 1 }}
              />

              <TextField
                label="Expenses"
                type="number"
                value={form.expenses}
                onChange={handleChange("expenses")}
                fullWidth
                inputProps={{ min: 0, step: "0.001" }}
              />

              <TextField
                label="Refunds"
                type="number"
                value={form.refunds}
                onChange={handleChange("refunds")}
                fullWidth
                inputProps={{ min: 0, step: "0.001" }}
              />

              {renderAgentFields()}

              <TextField
                label="Description"
                value={form.description}
                onChange={handleChange("description")}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseEditDialog}
              disabled={saving}
              sx={{ textTransform: "none", color: "#cbd5e1" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSale}
              disabled={saving}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                bgcolor: "#2563eb",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                },
              }}
            >
              {saving ? "Saving..." : "Update sale"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => {
            if (deletingId) return;
            setDeleteConfirmOpen(false);
            setSaleToDelete(null);
          }}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: dialogPaperSx }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Delete Sale</DialogTitle>
          <DialogContent
            dividers
            sx={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Are you sure you want to delete this sale record?
            </Typography>
            {saleToDelete && (
              <Typography sx={{ color: "#94a3b8", mt: 1 }}>
                {formatDateOnly(saleToDelete.sale_date)} ·{" "}
                {formatBD(saleToDelete.sales_amount)}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSaleToDelete(null);
              }}
              disabled={Boolean(deletingId)}
              sx={{ textTransform: "none", color: "#cbd5e1" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteSale}
              disabled={Boolean(deletingId)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#dc2626",
                "&:hover": {
                  bgcolor: "#b91c1c",
                },
              }}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AdminSales;
