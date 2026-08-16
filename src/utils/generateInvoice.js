import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order) => {
  const doc = new jsPDF();

  // Brand Name
  doc.setFontSize(22);
  doc.setTextColor(2, 113, 185); // theme blue
  doc.text('JUPITER FRESH', 14, 20);

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVOICE', 14, 30);

  // Order Details (Right side)
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Order ID: ${order.id}`, 130, 20);
  doc.text(`Date: ${order.date}`, 130, 26);
  doc.text(`Status: ${order.status || 'Placed'}`, 130, 32);

  // Customer Details (Left side)
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Billed To:', 14, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  const delivery = order.deliveryDetails || {};
  doc.text(delivery.name || 'N/A', 14, 52);
  doc.text(`+91 ${delivery.phone || order.userPhone || 'N/A'}`, 14, 58);
  doc.text(delivery.address || 'N/A', 14, 64);
  if (delivery.landmark) {
    doc.text(`Landmark: ${delivery.landmark}`, 14, 70);
  }

  // Items Table
  const tableColumn = ["Item", "Quantity", "Unit Price", "Total"];
  const tableRows = [];

  order.items.forEach(item => {
    const itemData = [
      item.name,
      item.qty,
      `Rs. ${item.currentPrice}`,
      `Rs. ${item.currentPrice * item.qty}`
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [2, 113, 185] }, // theme blue
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Items: ${order.items.reduce((sum, item) => sum + item.qty, 0)}`, 14, finalY);
  
  const deliveryCharge = (order.deliveryDetails && order.deliveryDetails.deliveryFee) ? order.deliveryDetails.deliveryFee : 0;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Delivery Charge: Rs. ${deliveryCharge}`, 130, finalY);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${order.grandTotal}`, 130, finalY + 8);

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for shopping with Jupiter Fresh!', 14, finalY + 28);

  // Save the PDF
  doc.save(`Invoice_${order.id}.pdf`);
};
