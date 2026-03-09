import { useEffect, useMemo, useState } from "react";
import { Boxes, CalendarClock, Clock3, FolderKanban, Package2, Shapes } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { productsApi, type Product } from "../../lib/api/productsApi";
import { materialsApi, type Material } from "../../lib/api/materialsApi";
import { bomApi, type BomLine } from "../../lib/api/bomApi";

type TimelineItem = {
  id: string;
  time: string;
  event: string;
  status: "Completed" | "In Progress";
  owner: string;
  eventType: "Collection" | "Product" | "Material" | "BOM";
  occurredAt: number;
};

const formatTimelineDate = (value?: string): string => {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TimelinePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const buildCollectionEvents = (collections: Collection[]): TimelineItem[] =>
    collections
      .filter((item) => String(item.Status ?? "").toLowerCase() !== "archived")
      .map((item) => {
        const createdAt = item.CreatedAt ?? "";
        return {
          id: `collection-${item.CollectionID}`,
          time: formatTimelineDate(createdAt),
          event: `Collection created: ${item.CollectionCode} - ${item.CollectionName}`,
          status: "Completed",
          owner: "PLM Manager",
          eventType: "Collection",
          occurredAt: new Date(createdAt).getTime() || 0,
        };
      });

  const buildProductEvents = (products: Product[]): TimelineItem[] =>
    products
      .filter((item) => String(item.Status ?? "").toLowerCase() !== "archived")
      .map((item) => {
        const createdAt = String((item as Product & { CreatedAt?: string }).CreatedAt ?? "");
        return {
          id: `product-${item.ProductID}`,
          time: formatTimelineDate(createdAt),
          event: `Product created: ${item.SKU} - ${item.Name}`,
          status: "Completed",
          owner: "PLM Manager",
          eventType: "Product",
          occurredAt: new Date(createdAt).getTime() || 0,
        };
      });

  const buildMaterialEvents = (materials: Material[]): TimelineItem[] =>
    materials
      .filter((item) => String(item.Status ?? "").toLowerCase() !== "archived")
      .map((item) => {
        const createdAt = item.CreatedAt ?? "";
        return {
          id: `material-${item.MaterialID}`,
          time: formatTimelineDate(createdAt),
          event: `Material created: ${item.Name}`,
          status: "Completed",
          owner: "PLM Manager",
          eventType: "Material",
          occurredAt: new Date(createdAt).getTime() || 0,
        };
      });

  const buildBomEvents = (bomLines: BomLine[]): TimelineItem[] =>
    bomLines.map((item) => {
      const createdAt = String((item as BomLine & { CreatedAt?: string }).CreatedAt ?? "");
      return {
        id: `bom-${item.BOMID}`,
        time: formatTimelineDate(createdAt),
        event: `BOM line created: ${item.MaterialName} (Product #${item.ProductID})`,
        status: "Completed",
        owner: "PLM Manager",
        eventType: "BOM",
        occurredAt: new Date(createdAt).getTime() || 0,
      };
    });

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const [collections, products, materials, bomLines] = await Promise.all([
        collectionsApi.list(),
        productsApi.list(),
        materialsApi.list(),
        bomApi.list(),
      ]);

      const events = [
        ...buildCollectionEvents(collections),
        ...buildProductEvents(products),
        ...buildMaterialEvents(materials),
        ...buildBomEvents(bomLines),
      ]
        .sort((a, b) => b.occurredAt - a.occurredAt)
        .map((item, index) => ({
          ...item,
          status: (index === 0 ? "In Progress" : "Completed") as TimelineItem["status"],
        }));

      setTimelineItems(events);
    } catch {
      setTimelineItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTimeline();
  }, []);

  const filteredTimeline = useMemo(
    () =>
      timelineItems.filter((item) => {
        const matchesSearch =
          item.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEventType =
          eventTypeFilter === "all" || item.eventType.toLowerCase() === eventTypeFilter.toLowerCase();
        return matchesSearch && matchesEventType;
      }),
    [timelineItems, searchQuery, eventTypeFilter],
  );

  const completedCount = filteredTimeline.filter((item) => item.status === "Completed").length;
  const inProgressCount = filteredTimeline.filter((item) => item.status === "In Progress").length;
  const totalCount = filteredTimeline.length;

  const eventTypeIcon = (eventType: TimelineItem["eventType"]) => {
    if (eventType === "Collection") return FolderKanban;
    if (eventType === "Product") return Package2;
    if (eventType === "Material") return Shapes;
    return Boxes;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Timeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real PLM activity stream from created collections, products, materials, and BOM records.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Live Activity Rule</p>
        <p className="mt-1 text-sm text-indigo-900">
          Timeline events are generated from backend records to keep audit visibility aligned with database activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{completedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Finished milestones</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-700">{inProgressCount}</p>
            <p className="mt-1 text-xs text-slate-500">Active timeline events</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-sky-700">{totalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Logged PLM creation activities</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">PLM Activity Timeline</CardTitle>
          <CardDescription>
            Modern chronological feed for created collection, product, material, and BOM events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Event Type"
            placeholder="Search event, owner, or timestamp..."
          >
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Type</p>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="bom">BOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading timeline events...
            </div>
          ) : (
            <div className="relative space-y-4 pl-7 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-300 before:to-slate-200">
              {filteredTimeline.map((item, index) => {
                const EventIcon = eventTypeIcon(item.eventType);
                return (
                  <div key={item.id} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="absolute -left-8 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow">
                      <EventIcon size={12} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{item.event}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Clock3 size={12} />
                        {item.time}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Shapes size={12} />
                        {item.eventType}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <CalendarClock size={12} />
                        {item.owner}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                        Step {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTimeline.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No timeline events found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
