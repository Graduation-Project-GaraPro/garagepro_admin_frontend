'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface AuditFiltersProps {
  onFilter: (filters: {
    search: string;
    changedBy: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  loading: boolean;
}

export function AuditFilters({ onFilter, loading }: AuditFiltersProps) {
  const [search, setSearch] = useState('');
  const [changedBy, setChangedBy] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ search, changedBy, dateFrom, dateTo });
  };

  const handleReset = () => {
    setSearch('');
    setChangedBy('');
    setDateFrom('');
    setDateTo('');
    onFilter({ search: '', changedBy: '', dateFrom: '', dateTo: '' });
  };

  const hasActiveFilters = search || changedBy || dateFrom || dateTo;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Search and filter audit history</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by summary, user, or policy ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <label className="text-sm font-medium">Changed By</label>
                <Input
                  placeholder="Username or email"
                  value={changedBy}
                  onChange={(e) => setChangedBy(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Active filters applied</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-auto p-0 text-blue-600 hover:text-blue-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}