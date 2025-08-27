import React, { useState } from 'react';
import axios from 'axios';
import { HR4 } from "../../api/HR4"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const api = axios.create({ baseURL: HR4.backend.uri });

export function ProcessPayrollDialog({ open, onOpenChange, payroll, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    await api.post(HR4.backend.api.payroll.process(payroll.id), { payment_method: paymentMethod });
    setLoading(false);
    onSuccess();
    onOpenChange(false);
  };

  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Payroll</DialogTitle>
        </DialogHeader>
        <Alert>
          <AlertDescription>
            Net amount to be paid: <strong>${Number(payroll.net_salary).toLocaleString()}</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mt-4">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={loading} onClick={handleProcess}>
            {loading ? 'Processing…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}