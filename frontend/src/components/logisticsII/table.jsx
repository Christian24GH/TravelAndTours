import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"

export default function TableComponent({ 
  list = [], 
  recordName = "record", 
  columns = [] 
}) {
  return (
    <Table>
      {list.length === 0 && (
        <TableCaption>No {recordName} found in the records.</TableCaption>
      )}

      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={col.cellClassName || ""}>
              {col.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {list.map((item, i) => (
          <motion.tr
            key={i}
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{ delay: i * 0.05 }}>
            {columns.map((col, j) => (
              <TableCell 
                  key={j} 
                  className={col.cellClassName || ""}
                >
                {col.render ? col.render(item) : item[col.accessor]}
              </TableCell>
            ))}
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}
