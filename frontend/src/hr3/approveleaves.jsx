import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {Button} from "@/components/ui/button"


export default function ApprovedLeaves(){
    return(
        <div>
            <Button>Create Reports</Button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Andrei</TableCell>
                        <TableCell>Annual</TableCell>
                        <TableCell>2023-01-01</TableCell>
                        <TableCell>2023-01-05</TableCell>
                        <TableCell>Vacation</TableCell>
                        <TableCell>Approved</TableCell>
                    </TableRow>
                </TableBody>
            </Table> 
        </div>
    )
}