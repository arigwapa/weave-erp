import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { inspectionApi, type QaBatchItem } from "../../lib/api/inspectionApi";

export default function InspectionQueuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<QaBatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingBatchId, setStartingBatchId] = useState<number | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const rows = await inspectionApi.getPending();
      setItems(Array.isArray(rows) ? rows : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue().catch(() => undefined);
    const intervalId = window.setInterval(() => {
      loadQueue().catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const startInspection = async (batchBoardId: number) => {
    setStartingBatchId(batchBoardId);
    try {
      await inspectionApi.startInspection(batchBoardId);
      setItems((prev) => prev.filter((row) => row.BatchBoardID !== batchBoardId));
      navigate("/qa/inspection-form");
    } finally {
      setStartingBatchId(null);
    }
  };

  const detailRows = useMemo(() => items.slice(0, 3), [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inspection Queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Prioritized queue by due date with drill-down metadata and production notes.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Priority Queue</CardTitle>
          <CardDescription>Batches submitted from production and ready for QA inspection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Collection Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">
                    Loading priority queue...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">
                    No submitted batches available for QA.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.BatchBoardID}>
                    <TableCell>{item.BatchNumber}</TableCell>
                    <TableCell>{item.VersionNumber}</TableCell>
                    <TableCell>{item.ProductName}</TableCell>
                    <TableCell>{item.CollectionName}</TableCell>
                    <TableCell>{item.DateSubmitted}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{item.QuantityProduced.toLocaleString()}</TableCell>
                    <TableCell>
                      <PrimaryButton
                        className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                        onClick={() => startInspection(item.BatchBoardID)}
                        disabled={startingBatchId === item.BatchBoardID}
                      >
                        Start Inspection
                      </PrimaryButton>
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
          <CardTitle className="text-base">Queue Snapshot</CardTitle>
          <CardDescription>Quick look at the first submitted batches and current QA state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(detailRows.length === 0 ? [["No batch yet", "-", "-", "-", "-"]] : detailRows.map((item) => [
            item.BatchNumber,
            item.ProductName,
            item.CollectionName,
            item.VersionNumber,
            item.Status,
          ])).map(([batchCode, productName, collectionName, versionNumber, status]) => (
            <div key={String(batchCode)} className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Batch</p>
              <p className="text-sm font-medium text-slate-800">{batchCode}</p>
              <p className="mt-2 text-xs text-slate-500">Product / Collection</p>
              <p className="text-sm text-slate-800">
                {productName} / {collectionName}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">Version: {versionNumber}</p>
                <StatusBadge status={String(status)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Drill-Down Detail</CardTitle>
          <CardDescription>Product/version/size/batch metadata and production notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Source", "Production Batch Management (Submitted)"],
            ["Action", "Use Start Inspection to move batch into Started Inspection Batches"],
            ["Inspection Path", "QA > Inspections"],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="text-sm font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
