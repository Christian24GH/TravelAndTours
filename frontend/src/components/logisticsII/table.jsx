import { format } from "date-fns"
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

  const formatValue = (val) => {
    if (val == null) return "";

    const date = new Date(val);
    if (!isNaN(date.getTime()) && typeof val === "string" && /\d{4}-\d{2}-\d{2}/.test(val)) {
      return format(date, "PPpp");
    }

    return val;
  };
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {columns.map((col, j) => {
              const rawValue = col.render ? col.render(item) : item[col.accessor];
              return (
                <TableCell key={j} className={col.cellClassName || ""}>
                  {formatValue(rawValue)}
                </TableCell>
              );
            })}
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}
