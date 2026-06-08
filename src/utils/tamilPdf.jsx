import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { tamilFonts } from "../font/NotoSansTamil";

// Merge Tamil font into pdfMake.vfs
pdfMake.vfs = {
  ...pdfFonts.vfs,
  "NotoSansTamil-Regular.ttf": tamilFonts.NotoSansTamil.normal
};

// Register Tamil font
pdfMake.fonts = {
  NotoSansTamil: {
    normal: "NotoSansTamil-Regular.ttf"
  }
};

// Optional debug
console.log("pdfMake.vfs keys:", Object.keys(pdfMake.vfs));
console.log(
  "Tamil font length:",
  pdfMake.vfs["NotoSansTamil-Regular.ttf"]
    ? pdfMake.vfs["NotoSansTamil-Regular.ttf"].length
    : "NOT FOUND"
);

// Export function to use in PaymentReport.jsx
export const downloadTamilPDF = (data) => {
  const docDefinition = {
    content: [
      { text: "வாடிக்கையாளர் அறிக்கை", style: "header" },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto"],
          body: [
            [
              { text: "தேதி", style: "tableHeader" },
              { text: "வாடிக்கையாளர் பெயர்", style: "tableHeader" },
              { text: "வாடிக்கையாளர் செலுத்தல்", style: "tableHeader" },
            ],
            ...data.map((row) => [row.date, row.customername, row.customerpayment]),
          ],
        },
        layout: "lightHorizontalLines",
      },
    ],
    defaultStyle: { font: " ", fontSize: 11 },
    styles: {
      header: { fontSize: 16 },
      tableHeader: { fontSize: 12 },
    },
  };

  pdfMake.createPdf(docDefinition).download("payment_report_tamil.pdf");
};
