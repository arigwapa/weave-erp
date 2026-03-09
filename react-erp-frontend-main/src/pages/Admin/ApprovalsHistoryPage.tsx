import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { useAuth } from "../../lib/AuthContext";
import {
  adminWorkflowApi,
  type ApprovalDecision,
  type ApprovalHistoryItem,
} from "../../lib/api/adminWorkflowApi";
import { getApiErrorMessage } from "../../lib/api/handleApiError";

const badgeByDecision: Record<
  ApprovalDecision,
  "default" | "secondary" | "danger"
> = {
  Approved: "default",
  Returned: "secondary",
  Rejected: "danger",
};

export default function ApprovalsHistoryPage() {
  const { role, branchId } = useAuth();
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    adminWorkflowApi
      .listApprovalsHistory({ role, branchId })
      .then((items) => {
        if (!mounted) return;
        setHistory(items);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
        setHistory([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role, branchId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Approvals History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historical decisions with reviewer identity, decision type, and business justification.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Decision Ledger</CardTitle>
          <CardDescription>Tracks who approved/rejected/returned and why.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading approvals history...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-500">No approvals history found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Approval ID</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Acted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.ApprovalID}>
                    <TableCell>{entry.ApprovalID}</TableCell>
                    <TableCell>{entry.CollectionCode}</TableCell>
                    <TableCell>{entry.VersionLabel}</TableCell>
                    <TableCell>{entry.ReviewerName}</TableCell>
                    <TableCell>
                      <Badge variant={badgeByDecision[entry.Decision]}>{entry.Decision}</Badge>
                    </TableCell>
                    <TableCell>{entry.Reason}</TableCell>
                    <TableCell>{entry.ActedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
