import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import {
  hydrateBatches,
  loadBatches,
  persistBatchesToBackend,
  saveBatches,
  type BatchRecord,
} from "../../lib/batchStorage";

const bumpVersionNumber = (versionNumber: string): string => {
  const raw = (versionNumber ?? "").trim();
  if (!raw) return "Version 1";

  const match = raw.match(/(\d+)(?!.*\d)/);
  if (!match) return `${raw} Rev 1`;

  const current = Number(match[1]);
  if (!Number.isFinite(current)) return `${raw} Rev 1`;
  return raw.replace(/(\d+)(?!.*\d)/, String(current + 1));
};

const buildNextBatchCode = (items: BatchRecord[]): string => {
  const maxSuffix = items.reduce((max, item) => {
    const code = String(item.code ?? "").trim();
    const matched = code.match(/-(\d+)$/);
    const value = matched ? Number(matched[1]) : 0;
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return `BAT-2603-${String(maxSuffix + 1).padStart(2, "0")}`;
};

export default function BatchApprovalRevisionPage() {
  const [batches, setBatches] = useState<BatchRecord[]>(() => loadBatches());
  const [reasonByCode, setReasonByCode] = useState<Record<string, string>>({});

  const submittedRows = useMemo(
    () => batches.filter((item) => item.status === "Submitted"),
    [batches],
  );
  const disapprovedRows = useMemo(
    () => batches.filter((item) => item.status === "Disapproved"),
    [batches],
  );

  useEffect(() => {
    hydrateBatches().then(setBatches).catch(() => undefined);
  }, []);

  useEffect(() => {
    saveBatches(batches);
    void persistBatchesToBackend(batches);
  }, [batches]);

  const approveBatch = (code: string) => {
    setBatches((prev) =>
      prev.map((item) => (item.code === code ? { ...item, status: "Approved" } : item)),
    );
  };

  const disapproveBatch = (code: string) => {
    const reason = (reasonByCode[code] ?? "").trim();
    if (!reason) return;
    setBatches((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, status: "Disapproved", handoffNotes: reason } : item,
      ),
    );
  };

  const createRevision = (item: BatchRecord) => {
    const nextVersion = bumpVersionNumber(item.versionNumber || item.version);
    const nextCode = buildNextBatchCode(batches);
    const nextItem: BatchRecord = {
      ...item,
      code: nextCode,
      versionNumber: nextVersion,
      version: nextVersion,
      status: "In Progress",
      handoffNotes: `Revision created from ${item.code}. Previous QA reason: ${item.handoffNotes ?? "N/A"}`,
    };
    setBatches((prev) => [nextItem, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Batch Approval & Revision</h1>
        <p className="mt-1 text-sm text-slate-500">
          QA approves or disapproves submitted batches. Disapproved rows can be recreated with a new version number.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">QA Decision Queue</CardTitle>
          <CardDescription>Submitted batches waiting for QA decision.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Run Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason (for disapproval)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submittedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    No submitted batches awaiting QA.
                  </TableCell>
                </TableRow>
              ) : (
                submittedRows.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.orderId || "-"}</TableCell>
                    <TableCell>{item.versionNumber || item.version}</TableCell>
                    <TableCell>{item.runCode || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={reasonByCode[item.code] ?? ""}
                        onChange={(event) =>
                          setReasonByCode((prev) => ({ ...prev, [item.code]: event.target.value }))
                        }
                        placeholder="Enter QA reason if disapproved"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <PrimaryButton
                          className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                          onClick={() => approveBatch(item.code)}
                        >
                          <CheckCircle2 size={14} className="mr-1" />
                          Approve
                        </PrimaryButton>
                        <SecondaryButton
                          className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                          onClick={() => disapproveBatch(item.code)}
                          disabled={!(reasonByCode[item.code] ?? "").trim()}
                        >
                          <XCircle size={14} className="mr-1" />
                          Disapprove
                        </SecondaryButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Disapproved for Revision</CardTitle>
          <CardDescription>
            Production manager analyzes QA reason and recreates batch with next version number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Current Version</TableHead>
                <TableHead>QA Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disapprovedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    No disapproved batches yet.
                  </TableCell>
                </TableRow>
              ) : (
                disapprovedRows.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.versionNumber || item.version}</TableCell>
                    <TableCell>{item.handoffNotes || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <PrimaryButton
                        className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                        onClick={() => createRevision(item)}
                      >
                        <RotateCcw size={14} className="mr-1" />
                        Create Revision
                      </PrimaryButton>
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
