import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { StatusBadge } from "../ui/StatusBadge";
import PrimaryButton from "../ui/PrimaryButton";
import type { QaBatchItem } from "../../lib/api/inspectionApi";
import { CheckCircle2, Clock3, Eye, LoaderCircle } from "lucide-react";
import TabBar from "../ui/TabBar";

type TabId = "pending" | "ongoing" | "completed";

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingRows: QaBatchItem[];
  ongoingRows: QaBatchItem[];
  completedRows: QaBatchItem[];
  loading: boolean;
  onStartInspection: (row: QaBatchItem) => void;
  onAddInspection: (row: QaBatchItem) => void;
  onViewDetails: (row: QaBatchItem) => void;
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
  onViewDetails,
}: Props) {
  const tabs = [
    { id: "pending", label: "Pending", icon: Clock3, count: pendingRows.length },
    { id: "ongoing", label: "Ongoing", icon: LoaderCircle, count: ongoingRows.length },
    { id: "completed", label: "Completed", icon: CheckCircle2, count: completedRows.length },
  ];

  return (
    <div>
      <div className="mb-4">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => onTabChange(id as TabId)} />
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
              <TableHead>Details</TableHead>
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
              <TableHead>Details</TableHead>
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
              <TableHead>Details</TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={activeTab === "completed" ? 11 : 9} className="py-8 text-center text-sm text-slate-500">
                Loading inspections...
              </TableCell>
            </TableRow>
          ) : activeTab === "pending" ? (
            pendingRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-slate-500">
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
                    <StatusBadge status={row.Status || "For Inspection"} />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onViewDetails(row)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      aria-label={`View details for ${row.BatchNumber}`}
                    >
                      <Eye size={14} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]" onClick={() => onStartInspection(row)}>
                      Start Inspection
                    </PrimaryButton>
                  </TableCell>
                </TableRow>
              ))
            )
          ) : activeTab === "ongoing" ? (
            ongoingRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-slate-500">
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
                    <button
                      type="button"
                      onClick={() => onViewDetails(row)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      aria-label={`View details for ${row.BatchNumber}`}
                    >
                      <Eye size={14} />
                    </button>
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
              <TableCell colSpan={11} className="py-8 text-center text-sm text-slate-500">
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
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onViewDetails(row)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    aria-label={`View details for ${row.BatchNumber}`}
                  >
                    <Eye size={14} />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
