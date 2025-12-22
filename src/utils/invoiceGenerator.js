import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadInvoice = (order) => {
  const doc = new jsPDF();

  // Brand Colors
  const brandColor = [191, 6, 3]; // #bf0603 (Red)
  const darkGray = [60, 60, 60];
  const lightGray = [150, 150, 150];

  // 1. HEADER SECTION
  // Company Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...brandColor);
  doc.text("EchoBay", 14, 20);

  // Company Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text("Premium Electronics Store", 14, 26);
  doc.text("Kochi, Kerala, India - 682001", 14, 31);
  doc.text("support@echobay.com | +91 9048752402", 14, 36);

  // INVOICE DETAILS (Right Side)
  doc.setFontSize(14);
  doc.setTextColor(...brandColor);
  doc.text("INVOICE", 196, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text(`Invoice No: #INV-${order.id}`, 196, 27, { align: "right" });
  
  const orderDate = order.date || order.created_at || new Date();
  doc.text(`Date: ${new Date(orderDate).toLocaleDateString("en-IN")}`, 196, 32, { align: "right" });
  
  const status = order.status ? order.status.toUpperCase() : "PAID";
  doc.text(`Status: ${status}`, 196, 37, { align: "right" });

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // 2. BILLING INFO
  let address = order.shipping || order.shipping_details || {};
  if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch(e) { address = {}; }
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Bill To:", 14, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  
  const name = address.full_name || address.name || "Valued Customer";
  const line1 = address.house_no || address.address || "";
  const line2 = `${address.city || ""} ${address.state ? ", " + address.state : ""}`;
  const zip = address.pincode || address.zip_code || "";
  const phone = address.phone || address.mobile || "";

  doc.text(name, 14, 58);
  doc.text(line1, 14, 63);
  doc.text(`${line2} - ${zip}`, 14, 68);
  if(phone) doc.text(`Phone: ${phone}`, 14, 73);

  // 3. PRODUCT TABLE
  const tableColumn = ["#", "Item Description", "Qty", "Unit Price", "Total"];
  const tableRows = [];
  const items = order.items || [];

  items.forEach((item, index) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    
    const itemData = [
      index + 1,
      item.name || item.product_name || "Product",
      quantity,
      `Rs. ${price.toLocaleString("en-IN")}`,
      `Rs. ${(price * quantity).toLocaleString("en-IN")}`,
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: "plain", // Cleaner look
    headStyles: { 
        fillColor: brandColor, 
        textColor: 255, 
        fontSize: 9, 
        fontStyle: 'bold',
        halign: 'center' 
    },
    columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
    },
    styles: { 
        fontSize: 9, 
        cellPadding: 4,
        textColor: [50, 50, 50]
    },
    alternateRowStyles: {
        fillColor: [245, 245, 245] // Light gray stripes
    }
  });

  // 4. TOTALS SECTION (Fixed Overlapping)
  const totalAmount = Number(order.total || order.total_amount || 0);
  let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 100) + 10;

  // Draw a box for totals
  doc.setFillColor(248, 248, 248);
  doc.rect(130, finalY - 5, 66, 25, 'F'); // x, y, w, h

  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text("Subtotal:", 140, finalY); // Label X
  doc.text(`Rs. ${totalAmount.toLocaleString("en-IN")}`, 190, finalY, { align: "right" }); // Value X

  // Grand Total
  finalY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...brandColor);
  doc.text("Grand Total:", 140, finalY + 2); // Label X
  doc.text(`Rs. ${totalAmount.toLocaleString("en-IN")}`, 190, finalY + 2, { align: "right" }); // Value X

  // 5. FOOTER
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 30, 196, pageHeight - 30);

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.text("Thank you for shopping with EchoBay!", 105, pageHeight - 20, { align: "center" });
  doc.text("This is a computer-generated invoice.", 105, pageHeight - 15, { align: "center" });

  doc.save(`EchoBay_Invoice_${order.id || "000"}.pdf`);
};