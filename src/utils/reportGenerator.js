import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { fmt, todayStr } from "./formatters";
import { toAmount } from "./dataHelpers";

export const generateTransactionReport = (transactions) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("MoneyMate Transaction Report", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const rows = Array.isArray(transactions) ? transactions : [];
  const tableData = rows.map(t => [
    t.date || "—",
    t.category || (t.type === "transfer" ? "Transfer" : "—"),
    t.account || "—",
    String(t.type || "unknown").toUpperCase(),
    fmt(toAmount(t.amount)),
    t.note || "-"
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Category", "Account", "Type", "Amount", "Note"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [45, 106, 159] }
  });
  
  doc.save(`moneymate-report-${todayStr()}.pdf`);
};
