import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm, Controller } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"
import { HR4 } from "../../api/HR4"

const api = HR4.backend.api

export function UpdateEmployeeDialog({ employee }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: employee.id,
      employee_code: employee.employee_code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      status: employee.status,
    },
  })

  const [open, setOpen] = useState(false)

  const onSubmit = async (data) => {
    try {
      let response = await axios.put(`${api.employees}/${employee.id}`, data)

      if (response.status === 200) {
        toast.success("Employee updated successfully!", { position: "top-center" })
        setOpen(false)
      }
    } catch (error) {
      if (error.status === 422) {
        toast.error(error.response.data.message, { position: "top-center" })
      }
      if (error.status === 500) {
        toast.error("Server Error", { position: "top-center" })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Employee {employee.employee_code}</DialogTitle>
          <DialogDescription>Update employee details and click save when done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <input {...register("id")} type="hidden" />

          {/* Employee Code */}
          <div className="flex flex-col gap-1">
            <Label>Employee Code</Label>
            {errors.employee_code && (
              <AlertDescription className="text-red-500">{errors.employee_code.message}</AlertDescription>
            )}
            <Input
              {...register("employee_code", { required: "Employee code is required" })}
              defaultValue={employee.employee_code}
              disabled
            />
          </div>

          {/* First Name */}
          <div className="flex flex-col gap-1">
            <Label>First Name</Label>
            {errors.first_name && (
              <AlertDescription className="text-red-500">{errors.first_name.message}</AlertDescription>
            )}
            <Input {...register("first_name", { required: "First name is required" })} />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <Label>Last Name</Label>
            {errors.last_name && (
              <AlertDescription className="text-red-500">{errors.last_name.message}</AlertDescription>
            )}
            <Input {...register("last_name", { required: "Last name is required" })} />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label>Email</Label>
            {errors.email && <AlertDescription className="text-red-500">{errors.email.message}</AlertDescription>}
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <Label>Phone</Label>
            {errors.phone && <AlertDescription className="text-red-500">{errors.phone.message}</AlertDescription>}
            <Input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Only numbers are allowed",
                },
              })}
              type="text"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1">
            <Label>Department</Label>
            {errors.department && (
              <AlertDescription className="text-red-500">{errors.department.message}</AlertDescription>
            )}
            <Input {...register("department", { required: "Department is required" })} />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            {errors.status && <AlertDescription className="text-red-500">{errors.status.message}</AlertDescription>}
            <Controller
              control={control}
              name="status"
              rules={{ required: "Status is required!" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <SelectTrigger className={errors.status ? "border-red-500 focus-visible:ring-red-300" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
