/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // ví dụ Modal from shadcn/ui
import { Loader2 } from "lucide-react";
import { apiClient } from "@/services/api-client";

interface Feedback {
  feedBackId: string;
  userId: string;
  userName: string;
  description: string;
  rating: number;
  repairOrderId: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  // FILTER / SORT / PAGINATION
  const [filterRating, setFilterRating] = useState<number | "">("");
  const [filterFromDate, setFilterFromDate] = useState<string>(""); // yyyy-mm-dd
  const [filterToDate, setFilterToDate] = useState<string>("");

  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any>("/FeedBack");
        setFeedbacks(res.data || []);
      } catch (err) {
        console.error("Fetch feedback error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, []);

  // 1. apply filter
  const filtered = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (filterRating !== "" && fb.rating !== filterRating) return false;
      if (filterFromDate && new Date(fb.createdAt) < new Date(filterFromDate))
        return false;
      if (
        filterToDate &&
        new Date(fb.createdAt) > new Date(filterToDate + "T23:59:59")
      )
        return false;
      return true;
    });
  }, [feedbacks, filterRating, filterFromDate, filterToDate]);

  // 2. sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: any = a[sortBy];
      let vb: any = b[sortBy];
      if (sortBy === "createdAt") {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  // 3. pagination
  const pageCount = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 4. statistics: count + percent per rating
  const stats = useMemo(() => {
    const total = filtered.length;
    const counts: Record<number, number> = {};
    for (let r = 1; r <= 5; r++) counts[r] = 0;
    for (const fb of filtered) {
      counts[fb.rating] = (counts[fb.rating] || 0) + 1;
    }
    const percents: Record<number, number> = {};
    for (let r = 1; r <= 5; r++) {
      percents[r] = total > 0 ? Math.round((counts[r] / total) * 100) : 0;
    }
    return { total, counts, percents };
  }, [filtered]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="rounded-2xl shadow mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            Feedback — Thống kê & Danh sách
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* --- Filters --- */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm">Filter Rating</label>
              <select
                className="border p-1 rounded"
                value={filterRating}
                onChange={(e) =>
                  setFilterRating(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">All</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">From Date</label>
              <input
                type="date"
                className="border p-1 rounded"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">To Date</label>
              <input
                type="date"
                className="border p-1 rounded"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Sort by</label>
              <select
                className="border p-1 rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="createdAt">Date</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="border rounded px-3 py-1 ml-2"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "Asc ↑" : "Desc ↓"}
              </button>
            </div>
          </div>

          {/* --- Statistics --- */}
          <div className="mb-6">
            <p>
              Total feedback: <strong>{stats.total}</strong>
            </p>
            <div className="flex gap-2 mt-2">
              {Object.entries(stats.counts).map(([r, cnt]) => (
                <div key={r} className="text-sm">
                  <strong>{r}★:</strong> {cnt} ({stats.percents[Number(r)]}%)
                </div>
              ))}
            </div>
          </div>

          {/* --- Table or Loading / Empty --- */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              No feedback available
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border">User</th>
                      <th className="p-3 border">Rating</th>
                      <th className="p-3 border">Created At</th>
                      <th className="p-3 border">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((fb) => (
                      <tr key={fb.feedBackId} className="hover:bg-gray-50">
                        <td className="p-3 border">{fb.userName}</td>
                        <td className="p-3 border font-medium">
                          {fb.rating}/5
                        </td>
                        <td className="p-3 border">
                          {new Date(fb.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 border">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">View</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Feedback Detail</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p>
                                  <strong>User:</strong> {fb.userName}
                                </p>
                                <p>
                                  <strong>Rating:</strong> {fb.rating}/5
                                </p>
                                <p>
                                  <strong>Description:</strong> {fb.description}
                                </p>
                                <p>
                                  <strong>Repair Order:</strong>{" "}
                                  {fb.repairOrderId}
                                </p>
                                <p>
                                  <strong>Created At:</strong>{" "}
                                  {new Date(fb.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <DialogFooter>
                                <Button>Close</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- Pagination Controls --- */}
              <div className="flex justify-between items-center mt-4">
                <button
                  className="border rounded px-3 py-1 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span>
                  Page {page} of {pageCount}
                </span>
                <button
                  className="border rounded px-3 py-1 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
