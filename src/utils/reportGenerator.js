import jsPDF from "jspdf";
import "jspdf-autotable";
import { fmt } from "./formatters";

export const generateTransactionReport = (transactions) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("MoneyMate Transaction Report", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableData = transactions.map(t => [
    t.date,
    t.category,
    t.account,
    t.type.toUpperCase(),
    fmt(t.amount),
    t.note || "-"
  ]);
  
  doc.autoTable({
    startY: 40,
    head: [["Date", "Category", "Account", "Type", "Amount", "Note"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [45, 106, 159] }
  });
  
  doc.save(`moneymate-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};
