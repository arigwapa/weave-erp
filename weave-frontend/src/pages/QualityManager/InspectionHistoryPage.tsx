import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { inspectionApi, type InspectionHistoryItem } from "../../lib/api/inspectionApi";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function InspectionHistoryPage() {
  const [rows, setRows] = useState<InspectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await inspectionApi.listHistory();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((item) => {
      if (resultFilter !== "all" && item.Result.toLowerCase() !== resultFilter) return false;
      if (!keyword) return true;
      const haystack = [
        item.InspectionID,
        item.BatchBoardID,
        item.BatchCode,
        item.ProductName,
        item.CollectionName,
        item.InspectorName,
        item.AQLLevel,
        item.InspectionLevel,
        item.QaDecision,
        item.Notes ?? "",
        item.DefectEntries ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [rows, search, resultFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inspection History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completed QA records with AQL parameters, thresholds, defects, result, notes, and audit timestamps.
        </p>
      </div>

      <Card className="rounded-2xl border-indigo-100 bg-indigo-50/40">
        <CardHeader>
          <CardTitle className="text-sm text-indigo-900">Flow aligned with Inspection table</CardTitle>
          <CardDescription className="text-indigo-800">
            Start Inspection marks batch as in progress. Finish Inspection saves full inspection details in the database and records the final quality decision.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Completed Inspections</CardTitle>
          <CardDescription>
            Use search and status filters to review Accepted/Rejected outcomes and inspector activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inspection, batch, product, collection, inspector..."
            />
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>AQL</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead>Defects</TableHead>
                <TableHead>Accept/Reject</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Inspection Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-8 text-center text-sm text-slate-500">
                    Loading inspection history...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="py-8 text-center text-sm text-slate-500">
                    No completed inspections found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.InspectionID}>
                    <TableCell className="font-medium">#{item.InspectionID}</TableCell>
                    <TableCell>{item.BatchCode || `Batch #${item.BatchBoardID}`}</TableCell>
                    <TableCell>{item.ProductName || "-"}</TableCell>
                    <TableCell>{item.CollectionName || "-"}</TableCell>
                    <TableCell>{item.InspectorName}</TableCell>
                    <TableCell>{item.AQLLevel}</TableCell>
                    <TableCell>{item.InspectionLevel}</TableCell>
                    <TableCell>{item.SampleSize.toLocaleString()}</TableCell>
                    <TableCell>{item.DefectsFound.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.AcceptThreshold}/{item.RejectThreshold}
                    </TableCell>
                    <TableCell>{item.QaDecision || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.Result} />
                    </TableCell>
                    <TableCell>{formatDate(item.InspectionDate)}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={item.DefectEntries || item.Notes || ""}>
                      {item.DefectEntries || item.Notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
