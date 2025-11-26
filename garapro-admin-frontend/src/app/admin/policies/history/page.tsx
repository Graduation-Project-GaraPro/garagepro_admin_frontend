'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, Calendar, User, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { 
  historyChangePolicyService, 
  AuditHistory,
  PaginationParams 
} from '@/services/historyChangePolicyService';
import { AuditFilters } from '@/components/admin/audit-history/AuditFilters';
import { AuditPagination } from '@/components/admin/audit-history/AuditPagination';
import { AuditDetailModal } from '@/components/admin/audit-history/AuditDetailModal';

interface FilterState {
  search: string;
  changedBy: string;
  dateFrom: string;
  dateTo: string;
}

export default function AuditHistoryPage() {
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    changedBy: '',
    dateFrom: '',
    dateTo: '',
  });

  // Detail modal state
  const [selectedAudit, setSelectedAudit] = useState<AuditHistory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    loadAuditHistory();
  }, [currentPage, pageSize]);

  const loadAuditHistory = async (filterParams: FilterState = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: PaginationParams = {
        page: currentPage,
        pageSize,
        ...filterParams,
      };

      const response = await historyChangePolicyService.getAuditHistory(params);
      setAuditHistory(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit history');
      toast.error('Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadAuditHistory(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadAuditHistory();
    toast.success('Audit history refreshed');
  };

  const handleViewDetails = (audit: AuditHistory) => {
    setSelectedAudit(audit);
    setIsDetailModalOpen(true);
  };

  const handleRevert = async (audit: AuditHistory, type: 'previous' | 'snapshot') => {
    try {
      setIsReverting(true);
  
      // Gọi service tương ứng
      await historyChangePolicyService.revertPolicy(audit.historyId, type);
  
      toast.success(`Policy reverted to ${type} successfully`);
      setIsDetailModalOpen(false);
  
      // Refresh lại danh sách history
      await loadAuditHistory();
    } catch (error) {
      console.error(`Failed to revert policy to ${type}:`, error);
      toast.error(`Failed to revert policy to ${type}`);
    } finally {
      setIsReverting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseChanges = (previous: string, current: string) => {
    try {
      const prev = JSON.parse(previous);
      const curr = JSON.parse(current);
      const changes: string[] = [];

      Object.keys(curr).forEach(key => {
        if (prev[key] !== curr[key] && key !== 'UpdatedAt' && key !== 'Histories') {
          changes.push(`${key}: ${prev[key]} → ${curr[key]}`);
        }
      });

      return changes;
    } catch {
      return ['Unable to parse changes'];
    }
  };

  if (error && auditHistory.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Audit History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all security policy changes
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <AuditFilters onFilter={handleFilter} loading={loading} />

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <>Found {totalItems} audit entr{totalItems === 1 ? 'y' : 'ies'}</>
          ) : (
            'No audit entries found'
          )}
        </div>
        
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

      {/* Audit History List */}
      <div className="space-y-4">
        {loading ? (
          <AuditHistorySkeleton />
        ) : (
          <>
            {auditHistory.map((audit) => {
              const changes = parseChanges(audit.previousValues, audit.newValues);
              
              return (
                <Card key={audit.historyId} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {audit.changeSummary}
                         
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                            <User className="h-3 w-3" />
                            {audit.changedByUser || 'System'}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(audit.changedAt)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(audit)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Changes:</h4>
                      <div className="space-y-1">
                        {changes.slice(0, 3).map((change, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border">
                            {change}
                          </div>
                        ))}
                        {changes.length > 3 && (
                          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-200">
                            +{changes.length - 3} more changes... 
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600 ml-1 font-medium"
                              onClick={() => handleViewDetails(audit)}
                            >
                              View all details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {auditHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-muted-foreground text-lg">No audit history found</p>
                  {filters.search || filters.changedBy || filters.dateFrom || filters.dateTo ? (
                    <Button 
                      variant="outline" 
                      onClick={() => handleFilter({ search: '', changedBy: '', dateFrom: '', dateTo: '' })}
                      className="mt-3"
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <AuditPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <AuditDetailModal
        audit={selectedAudit}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRevert={handleRevert}
        isReverting={isReverting}
      />
    </div>
  );
}

function AuditHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-l-4 border-l-gray-300">
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}