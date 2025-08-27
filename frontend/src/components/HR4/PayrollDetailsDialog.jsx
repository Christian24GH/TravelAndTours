import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HR4 } from "../../api/HR4"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

const api = axios.create({ baseURL: HR4.backend.uri });

export function PayrollDetailsDialog({ open, onOpenChange, payroll }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!payroll?.id) return;
    setLoading(true);
    api.get(HR4.backend.api.payroll.show(payroll.id))
      .then(res => setDetails(res.data.details))
      .finally(() => setLoading(false));
  }, [payroll]);

  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payroll Details</DialogTitle>
        </DialogHeader>
        {loading && <div className="text-center py-4">Loading…</div>}
        {!loading && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p><strong>Employee:</strong> {payroll.first_name} {payroll.last_name}</p>
              <p><strong>Net Salary:</strong> ${Number(payroll.net_salary).toLocaleString()}</p>
              <table className="w-full text-sm">
                <tbody>
                  {details.map(d => (
                    <tr key={d.id} className="border-b">
                      <td>{d.component_name}</td>
                      <td className={`text-right ${d.is_deduction ? 'text-red-600' : 'text-green-600'}`}>
                        {d.is_deduction ? '-' : ''}${Math.abs(d.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}