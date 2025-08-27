import React, { useState } from 'react';
import axios from 'axios';
import { HR4 } from "../../api/HR4"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const api = axios.create({ baseURL: HR4.backend.uri });

export function PayrollDialog({ open, onOpenChange, onSuccess }) {
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await api.get(HR4.backend.api.employees);
      setEmployees(data.data || data);
    })();
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    await api.post(HR4.backend.api.payroll.calculate, {
      employee_id: employeeId,
      pay_period_start: format(start, 'yyyy-MM-dd'),
      pay_period_end: format(end, 'yyyy-MM-dd'),
    });
    setLoading(false);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculate Payroll</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(e => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.first_name} {e.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {format(start, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={start} onSelect={setStart} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {format(end, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={end} onSelect={setEnd} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={loading} onClick={handleCalculate}>
            {loading ? 'Calculating…' : 'Calculate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}