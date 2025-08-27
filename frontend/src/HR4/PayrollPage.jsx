// pages/PayrollPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useEchoPublic } from '@laravel/echo-react';

// shadcn/ui you already have
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { PayrollDetailsDialog } from '@/components/HR4/PayrollDetailsDialog'
import { PayrollDialog } from '@/components/HR4/PayrollDialog'
import { ProcessPayrollDialog } from '@/components/HR4/ProcessPayrollDialog'


// your exact helpers / config
import { HR4 } from "../api/HR4";
const api = HR4.backend.api;

// Helpers for pagination dots
function getPaginationNumbers(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let last;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (last) {
      if (i - last === 2) rangeWithDots.push(last + 1);
      else if (i - last !== 1) rangeWithDots.push(<PaginationEllipsis key={`dots-${i}`} />);
    }
    rangeWithDots.push(i);
    last = i;
  }
  return rangeWithDots;
}

export default function PayrollPage() {
  /* -------------------------------------------------
   |  local state (same pattern as Employees.jsx)
   | ------------------------------------------------- */
  const [payrolls, setPayrolls]   = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  /* dialogs */
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  /* -------------------------------------------------
   |  fetch payrolls (same debounce / axios as Employees)
   | ------------------------------------------------- */
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      axios
        .get(api.payroll.list, { params: { page, q: search || undefined, status: search ? undefined : 'all' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
          setPayrolls(data);
          setTotalPage(res.data.last_page || 1);
        })
        .catch(() => toast.error('Error fetching payrolls', { position: 'top-center' }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  /* -------------------------------------------------
   |  real-time (same reverb usage as Employees)
   | ------------------------------------------------- */
  useEchoPublic('payroll-updates', 'PayrollCalculated', () => fetchAgain());
  useEchoPublic('payroll-updates', 'PayrollProcessed',  () => fetchAgain());

  const fetchAgain = () => {
    axios
      .get(api.payroll.list, { params: { page, q: search } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setPayrolls(data);
        setTotalPage(res.data.last_page || 1);
      });
  };

  /* -------------------------------------------------
   |  helpers
   | ------------------------------------------------- */
  const handleViewDetails = (p) => {
    setSelectedPayroll(p);
    setIsDetailsDialogOpen(true);
  };
  const handleProcessPayroll = (p) => {
    setSelectedPayroll(p);
    setIsProcessDialogOpen(true);
  };

  const badgeStyle = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-200 text-green-800';
      case 'calculated':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  /* -------------------------------------------------
   |  JSX (same skeleton / table layout as Employees)
   | ------------------------------------------------- */
  return (
    <main>
      {/* Search + Add */}
      <div className="flex mb-3 gap-2">
        <Input
          placeholder="Search payrolls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setIsPayrollDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Calculate Payroll
        </Button>
      </div>

      {/* Table */}
      <div className="min-h-96">
        <Table>
          {payrolls.length === 0 && !loading && (
            <TableCaption>No payroll records found.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              payrolls.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.first_name} {p.last_name}</div>
                    <div className="text-sm text-gray-500">{p.email}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(p.pay_period_start).toLocaleDateString()} –{' '}
                    {new Date(p.pay_period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${Number(p.gross_salary).toLocaleString()}</TableCell>
                  <TableCell>${Number(p.net_salary).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {p.status === 'calculated' && (
                      <Button size="sm" onClick={() => handleProcessPayroll(p)}>
                        Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (same as Employees) */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              to="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(p - 1, 1)); }}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {getPaginationNumbers(page, totalPage).map((num, idx) => (
            <PaginationItem key={idx}>
              {num === "..." ? (
                <span className="px-2">...</span>
              ) : (
                <PaginationLink
                  to="#"
                  onClick={(e) => { e.preventDefault(); setPage(num); }}
                  isActive={page === num}
                >
                  {num}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              to="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(p + 1, totalPage)); }}
              aria-disabled={page === totalPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* dialogs */}
      <PayrollDialog
        open={isPayrollDialogOpen}
        onOpenChange={setIsPayrollDialogOpen}
        onSuccess={() => fetchAgain()}
      />
      <PayrollDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        payroll={selectedPayroll}
        onSuccess={() => fetchAgain()}
      />
      <ProcessPayrollDialog
        open={isProcessDialogOpen}
        onOpenChange={setIsProcessDialogOpen}
        payroll={selectedPayroll}
        onSuccess={() => fetchAgain()}
      />
    </main>
  );
}