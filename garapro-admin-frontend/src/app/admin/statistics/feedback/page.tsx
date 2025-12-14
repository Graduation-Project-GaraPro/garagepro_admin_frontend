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
} from "@/components/ui/dialog";
import { Loader2, Star, Calendar, TrendingUp, Filter } from "lucide-react";
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
  const [filterFromDate, setFilterFromDate] = useState<string>("");
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
    const avgRating =
      total > 0 ? filtered.reduce((sum, fb) => sum + fb.rating, 0) / total : 0;
    for (let r = 1; r <= 5; r++) {
      percents[r] = total > 0 ? Math.round((counts[r] / total) * 100) : 0;
    }
    return { total, counts, percents, avgRating };
  }, [filtered]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Customer Feedback
          </h1>
          <p className="text-slate-600">
            View and analyze customer satisfaction ratings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Feedback</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.avgRating.toFixed(1)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200 md:col-span-2">
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-3">Rating Distribution</p>
              <div className="flex gap-4">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-slate-700">
                        {r}★
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                        style={{ width: `${stats.percents[r]}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {stats.counts[r]} ({stats.percents[r]}%)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">
                Filters & Sorting
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rating
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterRating}
                  onChange={(e) =>
                    setFilterRating(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <option value="">All Ratings</option>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="createdAt">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Order
                </label>
                <button
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortDir === "asc" ? "Ascending ↑" : "Descending ↓"}
                </button>
              </div>
            </div>

            {/* Table or Loading / Empty */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin w-12 h-12 text-blue-500 mb-4" />
                <p className="text-slate-600">Loading feedback...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">
                  No feedback found
                </p>
                <p className="text-sm text-slate-500">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Customer
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Rating
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Date
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">
                          Order ID
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-slate-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paged.map((fb) => (
                        <tr
                          key={fb.feedBackId}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {fb.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {fb.userName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  User ID: {fb.userId.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {renderStars(fb.rating)}
                              <span className="text-sm font-semibold text-slate-700">
                                {fb.rating}.0
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(fb.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {fb.repairOrderId.slice(0, 12)}...
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold text-slate-800">
                                    Feedback Details
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                      {fb.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">
                                        {fb.userName}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {new Date(
                                          fb.createdAt
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-slate-600 mb-2">
                                      Rating
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {renderStars(fb.rating)}
                                      <span className="text-lg font-bold text-slate-800">
                                        {fb.rating}.0 / 5.0
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-slate-600 mb-2">
                                      Feedback
                                    </p>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                                      {fb.description}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-600 mb-1">
                                        Repair Order ID
                                      </p>
                                      <p className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        {fb.repairOrderId}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600 mb-1">
                                        User ID
                                      </p>
                                      <p className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        {fb.userId}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button className="w-full bg-slate-600 hover:bg-slate-700">
                                    Close
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(page * ITEMS_PER_PAGE, sorted.length)} of{" "}
                    {sorted.length} results
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pageCount }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === pageCount ||
                            Math.abs(p - page) <= 1
                        )
                        .map((p, idx, arr) => (
                          <div key={p} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                            <button
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                p === page
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-slate-100 text-slate-700"
                              }`}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </button>
                          </div>
                        ))}
                    </div>
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={page >= pageCount}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
