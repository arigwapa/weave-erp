import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge } from "../ui/StatusBadge";
import PrimaryButton from "../ui/PrimaryButton";
import type { QaBatchItem } from "../../lib/api/inspectionApi";

type TabId = "pending" | "ongoing" | "completed";

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingRows: QaBatchItem[];
  ongoingRows: QaBatchItem[];
  completedRows: QaBatchItem[];
  loading: boolean;
  onStartInspection: (batchId: number) => void;
  onAddInspection: (row: QaBatchItem) => void;
};

export function InspectionTabs({
  activeTab,
  onTabChange,
  pendingRows,
  ongoingRows,
  completedRows,
  loading,
  onStartInspection,
  onAddInspection,
}: Props) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "pending" as const, label: `Pending (${pendingRows.length})` },
          { id: "ongoing" as const, label: `Ongoing (${ongoingRows.length})` },
          { id: "completed" as const, label: `Completed (${completedRows.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          {activeTab === "pending" ? (
            <TableRow>
              <TableHead>BatchBoardID</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Quantity Produced</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          ) : activeTab === "ongoing" ? (
            <TableRow>
              <TableHead>BatchBoardID</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Started At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          ) : (
            <TableRow>
              <TableHead>BatchBoardID</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Inspection Date</TableHead>
              <TableHead>Sample Size</TableHead>
              <TableHead>Defects Found</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={activeTab === "completed" ? 10 : 8} className="py-8 text-center text-sm text-slate-500">
                Loading inspections...
              </TableCell>
            </TableRow>
          ) : activeTab === "pending" ? (
            pendingRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">
                  No pending inspections.
                </TableCell>
              </TableRow>
            ) : (
              pendingRows.map((row) => (
                <TableRow key={row.BatchBoardID}>
                  <TableCell>{row.BatchBoardID}</TableCell>
                  <TableCell>{row.BatchNumber}</TableCell>
                  <TableCell>{row.VersionNumber || "-"}</TableCell>
                  <TableCell>{row.ProductName}</TableCell>
                  <TableCell>{row.QuantityProduced}</TableCell>
                  <TableCell>{row.DateSubmitted}</TableCell>
                  <TableCell>
                    <StatusBadge status="Pending" />
                  </TableCell>
                  <TableCell>
                    <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]" onClick={() => onStartInspection(row.BatchBoardID)}>
                      Start Inspection
                    </PrimaryButton>
                  </TableCell>
                </TableRow>
              ))
            )
          ) : activeTab === "ongoing" ? (
            ongoingRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">
                  No ongoing inspections.
                </TableCell>
              </TableRow>
            ) : (
              ongoingRows.map((row) => (
                <TableRow key={row.BatchBoardID}>
                  <TableCell>{row.BatchBoardID}</TableCell>
                  <TableCell>{row.BatchNumber}</TableCell>
                  <TableCell>{row.VersionNumber || "-"}</TableCell>
                  <TableCell>{row.ProductName}</TableCell>
                  <TableCell>{row.Inspector || "-"}</TableCell>
                  <TableCell>{row.StartedAt || "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status="For Inspection" />
                  </TableCell>
                  <TableCell>
                    <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]" onClick={() => onAddInspection(row)}>
                      Add Inspection
                    </PrimaryButton>
                  </TableCell>
                </TableRow>
              ))
            )
          ) : completedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center text-sm text-slate-500">
                No completed inspections.
              </TableCell>
            </TableRow>
          ) : (
            completedRows.map((row) => (
              <TableRow key={`${row.BatchBoardID}-${row.InspectionDate ?? ""}`}>
                <TableCell>{row.BatchBoardID}</TableCell>
                <TableCell>{row.BatchNumber}</TableCell>
                <TableCell>{row.VersionNumber || "-"}</TableCell>
                <TableCell>{row.ProductName}</TableCell>
                <TableCell>{row.Inspector || "-"}</TableCell>
                <TableCell>{row.InspectionDate || "-"}</TableCell>
                <TableCell>{row.SampleSize ?? "-"}</TableCell>
                <TableCell>{row.DefectsFound ?? "-"}</TableCell>
                <TableCell>
                  <StatusBadge status={row.Result || "Review Required"} />
                </TableCell>
                <TableCell>
                  <StatusBadge status="Inspection Finished" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
