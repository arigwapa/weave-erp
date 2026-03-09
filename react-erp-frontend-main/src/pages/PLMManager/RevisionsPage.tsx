import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircle, RotateCcw, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { plmRevisionsApi, type PlmRevisionQueueItem } from "../../lib/api/plmRevisionsApi";

export default function RevisionsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PlmRevisionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      try {
        const data = await plmRevisionsApi.list();
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadQueue();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const query = searchQuery.toLowerCase();
        return (
          row.CollectionCode.toLowerCase().includes(query) ||
          row.CollectionName.toLowerCase().includes(query) ||
          row.AdminDecision.toLowerCase().includes(query)
        );
      }),
    [rows, searchQuery],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Rejected & Revisions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Collections returned by admin for revision/rework before resubmission to admin.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Revision Queue</CardTitle>
          <CardDescription>
            Open the affected collection, revise details/BOM/budget, then submit to admin again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Queue Filter"
            placeholder="Search collection code, name, decision..."
            inlineControls={
              <SecondaryButton icon={RotateCcw} onClick={() => setSearchQuery("")}>
                Reset
              </SecondaryButton>
            }
          >
            <div className="p-3 text-xs text-slate-500">Queue populated from admin rejection/revision decisions.</div>
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    {isLoading ? "Loading revision queue..." : "No returned collection found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.CollectionID}>
                    <TableCell>
                      <p className="font-medium text-slate-800">{row.CollectionName}</p>
                      <p className="text-xs text-slate-500">{row.CollectionCode}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.AdminDecision || row.Status} />
                    </TableCell>
                    <TableCell className="max-w-md text-xs text-slate-600">
                      {row.AdminDecisionReason || "No reason provided."}
                    </TableCell>
                    <TableCell>{row.UpdatedAt}</TableCell>
                    <TableCell className="text-right">
                      {row.IsRevision ? (
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={ArrowRightCircle}
                            onClick={() =>
                              navigate(`/plm/collections?collectionId=${row.CollectionID}&mode=revision`)
                            }
                          >
                            Revise Collection
                          </SecondaryButton>
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={Wallet}
                            onClick={() =>
                              navigate(`/plm/budget-planner?collectionId=${row.CollectionID}&mode=revision&openBudgetModal=1`)
                            }
                          >
                            Revise Budget
                          </SecondaryButton>
                        </div>
                      ) : (
                        <SecondaryButton
                          className="!rounded-full !px-4 !py-2 !text-xs"
                          onClick={() => navigate(`/plm/collections?collectionId=${row.CollectionID}`)}
                        >
                          Open Collection
                        </SecondaryButton>
                      )}
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
