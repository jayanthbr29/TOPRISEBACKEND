
const { uploadFile } = require("./s3Helper");
const path = require("path");
const PDFDocument = require('pdfkit');

const axios = require('axios');
const { PassThrough } = require('stream');

const generateInvoiceHtml = async (customerDetails, orderId, orderDate, placeOfSupply, placeOfDelivery, items, shippingCharges, totalOrderAmount, invoiceNumber) => {

  //sample data to be passed
  /*
   const customerDetails = {
      name: "John Doe",
      address: "123 Main Street",
      pincode: "12345",
      phone: "123-456-7890",   
      email: "V1d9d@example.com",
  }

  */
  // item details
  /*
  [
{
  productName: "Varasiddhi Silks Men's Formal Shirt (SH-05-42, Navy Blue, 42)",
  sku: "B07KGF3KW8",
  unitPrice: 538.10,
  quantity: 1,
  taxRate: "2.5%",
  cgstPercent: 2.5,
  cgstAmount: 13.45,
  sgstPercent: 2.5,
  sgstAmount: 13.45,
  totalAmount: 565.00
},
{
  productName: "Shipping Charges",
  sku: "SHIP001",
  unitPrice: 30.96,
  quantity: 1,
  taxRate: "2.5%",
  cgstPercent: 2.5,
  cgstAmount: 0.77,
  sgstPercent: 2.5,
  sgstAmount: 0.77,
  totalAmount: 32.50
}
]

  */


  try {

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #000;
      }

      .header {
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .logo {
        float: left;
        width: 100px;
      }

      .clearfix {
        clear: both;  
      }

      .section {
        margin: 10px 0;
      }

      .bold {
        font-weight: bold;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th,
      td {
        border: 1px solid #000;
        padding: 4px;
        text-align: left;
      }

      .right {
        text-align: right;
      }

      .center {
        text-align: center;
      }

      .no-border {
        border: none;
      }

      .footer {
        font-size: 10px;
        margin-top: 20px;
      }

      .invoice-summary {
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="section">
      <img
        src="https://firebasestorage.googleapis.com/v0/b/lmseducationplaform.appspot.com/o/Media%201.svg?alt=media&token=454fba64-184a-4612-a5df-e473f964daa1"
        class="logo"
        height="100"
      />
      <div style="float: right; text-align: right">
        <div class="bold">Tax Invoice/Bill of Supply/Cash Memo</div>
        <div>(Original for Recipient)</div>
      </div>
    </div>

    <div class="clearfix"></div>

    <div class="section">
      <div style="width: 50%; float: left">
        <div class="bold">Sold By :</div>
        Varasiddhi Silk Exports<br />
        #75, 3rd Cross, Lalbagh Road<br />
        BENGALURU, KARNATAKA, 560027<br />
        IN<br />
        <br />
        <strong>PAN No:</strong> AACFV3325K<br />
        <strong>GST Registration No:</strong> 29AACFV3325K1ZY
      </div>

      <div style="width: 45%; float: right">
        <div class="bold">Billing Address :</div>
        <br>
        ${customerDetails.name}<br />
        ${customerDetails.address}<br />
        ${customerDetails.pincode}<br />
        ${customerDetails.phone}<br />
        INDIA<br />
        <br/>
        <br/>
        <br/>
        <!-- State/UT Code: 29<br /><br /> -->

        <div class="bold">Shipping Address :</div>
        <br>
        ${customerDetails.name}<br />
        ${customerDetails.address}<br />
        ${customerDetails.pincode}<br />
        ${customerDetails.phone}<br />
        INDIA<br />
        <!-- State/UT Code: 29<br /> -->
      </div>
    </div>

    <div class="clearfix"></div>

    <div class="section">
      <strong>Order Number:</strong> ${orderId}<br />
      <strong>Order Date:</strong> ${orderDate}<br />
      <strong>Invoice Number:</strong> ${invoiceNumber}<br />
      <!-- <strong>Invoice Details:</strong> KA-310565025-1920<br /> -->
      <strong>Invoice Date:</strong> ${orderDate}<br />
     <!-- <strong>Place of supply:</strong> ${placeOfSupply}<br />
      <strong>Place of delivery:</strong> ${placeOfDelivery}<br /> -->
    </div>

    <table>
      <thead>
        <tr>
          <th>Sl. No</th>
          <th>Description</th>
          <th>Unit Price</th>
          <th>Qty</th>
          <th>Net Amount</th>
          <th>Tax Rate</th>
          <th>Tax Type</th>
          <th>Tax Amount</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        #items: ${items.length}
        ${items.map((item, index) => {
      return (
        `

        <tr>
          <td>${index + 1}</td>
          <td>
           ${item.productName} (${item.sku})<br />
           
          </td>
          <td class="right">₹${item.unitPrice}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">₹${item.unitPrice * item.quantity}</td></td>
          <td class="center">${item.cgstPercent}</td>
          <td class="center">CGST</td>
          <td class="right">₹${item.cgstAmount}</td>
          <td class="right"></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td class="right"></td>
          <td class="center"></td>
          <td class="right"></td>
          <td class="center">${item.sgstPercent}</td>
          <td class="center">SGST</td>
          <td class="right">₹${item.sgstAmount}</td>
          <td class="right">₹${item.totalAmount}</td>
        </tr>

                    `
      )
    })
      }
       
        <tr>
          <td
            class="right"
            colspan="9"
            style="border-right: 1px solid #000 !important; height: 20px"
          ></td>
        </tr>
        <tr>
          <td></td>
          <td>Shipping Charges</td>
          <td></td>
          <td></td>
          <td class="right">₹${shippingCharges}</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="right">₹${shippingCharges}</td>
        </tr>
       
        <tr>
          <td colspan="8" class="right bold">TOTAL:</td>
          <td class="right bold">₹${totalOrderAmount}</td>
        </tr>
      </tbody>
    </table>

    <div class="section">
    //   <div class="bold">Amount in Words:</div>
    //   {{amountInWords}}<br /><br />
      <!-- <div style="float: right; text-align: right;">
        For Varasiddhi Silk Exports:<br /><br /><br />
        <strong>Authorized Signatory</strong>
      </div> -->
    </div>

    <div class="clearfix"></div>

    <!-- <div class="footer">
      Whether tax is payable under reverse charge - No<br /><br />
      <small>
        *ASPL/ARSPL – Amazon entities. Invoice is not a demand for payment.<br />
        Customers desiring to avail GST input credit must create business accounts and order from Amazon Business.<br />
      </small>
    </div> -->
  </body>
</html>
`;

  } catch (error) {
    console.error("Error generating invoice HTML:", error);
    throw error;
  }
}



const bufferFromStream = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

// const generateInvoicePdfBuffer = async (
//   customerDetails,
//   orderId,
//   orderDate,
//   placeOfSupply,
//   placeOfDelivery,
//   items,
//   shippingCharges,
//   totalOrderAmount,
//   invoiceNumber
// ) => {
//   // Validate input parameters
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     throw new Error('Items array is required and must not be empty');
//   }

//   // Validate customer details
//   if (!customerDetails || !customerDetails.name) {
//     throw new Error('Customer details with name are required');
//   }

//   const doc = new PDFDocument({
//     margin: 50,
//     size: 'A4',
//     bufferPages: true // Enable page tracking
//   });

//   // Register fonts
//   doc.registerFont('DejaVu-Bold', path.resolve(__dirname, 'font', 'DejaVuSans-Bold.ttf'));
//   doc.font('DejaVu-Bold', path.resolve(__dirname, 'font', 'DejaVuSans-Bold.ttf'));
//   doc.registerFont('DejaVu', path.resolve(__dirname, 'font', 'DejaVuSans.ttf'));
//   doc.font('DejaVu', path.resolve(__dirname, 'font', 'DejaVuSans.ttf'));

//   const stream = new PassThrough();
//   doc.pipe(stream);

//   // Load logo image
//   const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/lmseducationplaform.appspot.com/o/Media%201.png?alt=media&token=ec43244b-eed6-4a25-92a5-9a6694f6b25e';
//   let imageBuffer;
//   try {
//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     imageBuffer = Buffer.from(response.data, 'binary');
//   } catch (err) {
//     console.warn('⚠️ Could not load logo image, skipping...', err.message);
//     imageBuffer = null;
//   }

//   // Constants for layout
//   const pageMargin = 50;
//   const rowHeight = 20;
//   const lineHeight = 15;
//   const colWidths = [30, 130, 60, 40, 60, 50, 50, 60, 60];
//   const tableWidth = colWidths.reduce((a, b) => a + b, 0);
//   const maxY = 850; // Approximate bottom margin for A4
//   let currentPage = 1;

//   // Helper function to check page break
//   const checkPageBreak = (requiredHeight) => {
//     if (doc.y + requiredHeight > maxY) {
//       doc.addPage();
//       currentPage++;
//       doc.y = pageMargin;
//       return true;
//     }
//     return false;
//   };

//   // Render logo if available
//   if (imageBuffer) {
//     doc.image(imageBuffer, 40, 45, { width: 80 });
//   }

//   // Header
//   doc.font('DejaVu-Bold').fontSize(16)
//     .text('Tax Invoice / Bill of Supply / Cash Memo', 200, 50, { align: 'right' });
//   doc.font('DejaVu').fontSize(10)
//     .text('(Original for Recipient)', { align: 'right' });

//   doc.moveDown(4);

//   // Company and Customer Info - Two Column Layout
//   const infoY = doc.y;
//   const column1X = pageMargin;
//   const column2X = 350;

//   // Sold By section (Left Column)
//   doc.font('DejaVu-Bold').text('Sold By:', column1X, infoY);
//   doc.font('DejaVu')
//     .text('Varasiddhi Silk Exports', column1X, infoY + lineHeight)
//     .text('#75, 3rd Cross, Lalbagh Road', column1X, infoY + lineHeight * 2)
//     .text('BENGALURU, KARNATAKA, 560027, IN', column1X, infoY + lineHeight * 3)
//     .text('PAN No: AACFV3325K', column1X, infoY + lineHeight * 4)
//     .text('GSTIN: 29AACFV3325K1ZY', column1X, infoY + lineHeight * 5)
//     .text('', column1X, infoY + lineHeight * 6);

//   // Billing Address (Right Column)
//   doc.font('DejaVu-Bold').text('Billing Address:', column2X, infoY);
//   doc.font('DejaVu')
//     .text(customerDetails.name, column2X, infoY + lineHeight)
//     .text(customerDetails.phone, column2X, infoY + lineHeight * 2)
//     .text(customerDetails.address, column2X, infoY + lineHeight * 3)
//     .text(customerDetails.pincode, column2X, infoY + lineHeight * 5)

//     // .text('INDIA', column2X, infoY + lineHeight * 5)
//     .text('', column2X, infoY + lineHeight * 6);


//   // Shipping Address (Right Column) - Fixed Y-positions
//   doc.font('DejaVu-Bold').text('Shipping Address:', column2X, infoY + lineHeight * 7);
//   doc.font('DejaVu')
//     .text(customerDetails.name, column2X, infoY + lineHeight * 8)
//     .text(customerDetails.phone, column2X, infoY + lineHeight * 9)
//     .text(customerDetails.address, column2X, infoY + lineHeight * 10)
//     .text(customerDetails.pincode, column2X, infoY + lineHeight * 12)

//   // .text('INDIA', column2X, infoY + lineHeight * 12);



//   // Order By section (Left Column)
//   doc.font('DejaVu-Bold').text('Order Details :', column1X, infoY + lineHeight * 7);
//   doc.font('DejaVu')
//     .text(`Order Number: ${orderId}`, column1X, infoY + lineHeight * 8)
//     .text(`Order Date: ${orderDate}`, column1X, infoY + lineHeight * 9)
//     .text(`Invoice Number: ${invoiceNumber}`, column1X, infoY + lineHeight * 10)
//     .text(`Invoice Date: ${orderDate}`, column1X, infoY + lineHeight * 11)
//     .text(`Place of Supply: ${placeOfSupply}`, column1X, infoY + lineHeight * 12)
//     .text(`Place of Delivery: ${placeOfDelivery}`, column1X, infoY + lineHeight * 13)
//     .text('', column1X, infoY + lineHeight * 14);


//   doc.y = infoY + lineHeight * 14 + 20;





//   // Table Headers
//   const drawTableHeaders = () => {
//     doc.font('Helvetica-Bold'); // Using a more common font for testing
//     const headers = [
//       { text: 'Sl. No', align: 'left', width: colWidths[0] },
//       { text: 'Description', align: 'left', width: colWidths[1] },
//       { text: 'Unit Price', align: 'right', width: colWidths[2] },
//       { text: 'Qty', align: 'right', width: colWidths[3] },
//       { text: 'Net Amount', align: 'right', width: colWidths[4] },
//       { text: 'Tax %', align: 'right', width: colWidths[5] },
//       { text: 'Tax Type', align: 'right', width: colWidths[6] },
//       { text: 'Tax Amt', align: 'right', width: colWidths[7] },
//       { text: 'Total Amt', align: 'right', width: colWidths[8] }
//     ];

//     // Save current y position for the line
//     const lineY = doc.y + rowHeight;
//     const initialY = doc.y;
//     const headersX = pageMargin;
//     headers.forEach((header, i) => {
//       doc.y = initialY;
//       const currentX = headersX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);

//       doc.text(
//         header.text,
//         currentX,
//         doc.y,
//         {
//           width: colWidths[i],
//           align: header.align,
//           lineBreak: false // Prevent text from causing row height changes
//         }
//       );
//     });

//     // Move to next line after headers
//     doc.y = initialY + rowHeight;

//     // Draw header underline
//     doc.moveTo(pageMargin, lineY)
//       .lineTo(pageMargin + tableWidth, lineY)
//       .lineWidth(0.5) // Thinner line might look better
//       .stroke();

//     doc.y = lineY + 10;
//   };

//   // Draw initial headers
//   drawTableHeaders();
//   // Helper function to estimate text height
//   function getTextHeight(doc, text, width, fontSize = 10, lineHeight = 1.2) {
//     const words = text.split(' ');
//     let lineCount = 1;
//     let currentLineLength = 0;

//     words.forEach(word => {
//       const wordWidth = doc.widthOfString(word + ' ');
//       if (currentLineLength + wordWidth > width) {
//         lineCount++;
//         currentLineLength = wordWidth;
//       } else {
//         currentLineLength += wordWidth;
//       }
//     });

//     return lineCount * fontSize * lineHeight;
//   }

//   // Process items
//   items.forEach((item, i) => {
//     // Validate and set default values for item properties
//     const unitPrice = parseFloat(item.unitPrice) || 0;
//     const quantity = parseInt(item.quantity) || 1;
//     const cgstPercent = parseFloat(item.cgstPercent) || 0;
//     const cgstAmount = parseFloat(item.cgstAmount) || 0;
//     const sgstPercent = parseFloat(item.sgstPercent) || 0;
//     const sgstAmount = parseFloat(item.sgstAmount) || 0;
//     const totalAmount = parseFloat(item.totalAmount) || 0;

//     const netAmount = unitPrice * quantity;
//     const descText = `${item.productName || 'Product'} (${item.sku || 'N/A'})`;
//     const descHeight = getTextHeight(doc, descText, colWidths[1], 10, 1.2);
//     const neededRowHeight = Math.max(descHeight, rowHeight) + 5;
//     // Check if we need a new page (2 rows per item + buffer)
//     if (checkPageBreak(neededRowHeight * 2 + 40)) {
//       drawTableHeaders();
//     }

//     // Main item row
//     const row1Y = doc.y;
//     doc.font('DejaVu')
//       .text((i + 1).toString(), pageMargin, row1Y, { width: colWidths[0] })
//       .text(`${item.productName || 'Product'} (${item.sku || 'N/A'})`, pageMargin + colWidths[0], row1Y, {
//         width: colWidths[1],
//         lineGap: 2
//       })
//       .text(`₹${unitPrice.toFixed(2)}`, pageMargin + colWidths.slice(0, 2).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[2],
//         align: 'right'
//       })
//       .text(quantity.toString(), pageMargin + colWidths.slice(0, 3).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[3],
//         align: 'right'
//       })
//       .text(`₹${netAmount.toFixed(2)}`, pageMargin + colWidths.slice(0, 4).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[4],
//         align: 'right'
//       })
//       .text(`${cgstPercent}%`, pageMargin + colWidths.slice(0, 5).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[5],
//         align: 'right'
//       })
//       .text('CGST', pageMargin + colWidths.slice(0, 6).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[6],
//         align: 'right'
//       })
//       .text(`₹${cgstAmount.toFixed(2)}`, pageMargin + colWidths.slice(0, 7).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[7],
//         align: 'right'
//       })
//       .text('', pageMargin + colWidths.slice(0, 8).reduce((a, b) => a + b, 0), row1Y, {
//         width: colWidths[8],
//         align: 'right'
//       });

//     // SGST row
//     const row2Y = row1Y + rowHeight;
//     doc.font('DejaVu')
//       .text('', pageMargin, row2Y, {
//         width: colWidths.slice(0, 5).reduce((a, b) => a + b, 0)
//       })
//       .text(`${sgstPercent}%`, pageMargin + colWidths.slice(0, 5).reduce((a, b) => a + b, 0), row2Y, {
//         width: colWidths[5],
//         align: 'right'
//       })
//       .text('SGST', pageMargin + colWidths.slice(0, 6).reduce((a, b) => a + b, 0), row2Y, {
//         width: colWidths[6],
//         align: 'right'
//       })
//       .text(`₹${sgstAmount.toFixed(2)}`, pageMargin + colWidths.slice(0, 7).reduce((a, b) => a + b, 0), row2Y, {
//         width: colWidths[7],
//         align: 'right'
//       })
//       .text(`₹${totalAmount.toFixed(2)}`, pageMargin + colWidths.slice(0, 8).reduce((a, b) => a + b, 0), row2Y, {
//         width: colWidths[8],
//         align: 'right'
//       });

//     // Draw row borders
//     // doc.moveTo(pageMargin, row1Y+5 + neededRowHeight * 2)
//     //   .lineTo(pageMargin + tableWidth, row1Y + neededRowHeight * 2)
//     //   .stroke();

//     doc.y = row2Y + neededRowHeight;
//   });

//   // Shipping and Total
//   if (checkPageBreak(rowHeight * 2 + 20)) {
//     doc.addPage();
//     doc.y = pageMargin;
//   }
//   doc.y = doc.y + 10;

//   // Validate shipping charges and total order amount
//   const validatedShippingCharges = parseFloat(shippingCharges) || 0;
//   const validatedTotalOrderAmount = parseFloat(totalOrderAmount) || 0;

//   // Shipping Charges
//   const shippingY = doc.y;
//   doc.font('DejaVu-Bold')
//     .text('Shipping Charges', pageMargin, shippingY);
//   doc.font('DejaVu')
//     .text(`₹${validatedShippingCharges.toFixed(2)}`, pageMargin + tableWidth - colWidths[8], shippingY, {
//       width: colWidths[8],
//       align: 'right'
//     });

//   // Total
//   const totalY = shippingY + rowHeight;
//   doc.font('DejaVu-Bold')
//     .text('TOTAL:', pageMargin + tableWidth - colWidths[7] - colWidths[8], totalY, {
//       width: colWidths[7],
//       align: 'right'
//     });
//   doc.font('DejaVu-Bold')
//     .text(`₹${validatedTotalOrderAmount.toFixed(2)}`, pageMargin + tableWidth - colWidths[8], totalY, {
//       width: colWidths[8],
//       align: 'right'
//     });
//   doc.y = doc.y + 10;
//   // Draw final borders
//   doc.moveTo(pageMargin, shippingY)
//     .lineTo(pageMargin + tableWidth, shippingY)
//     .stroke();

//   doc.moveTo(pageMargin, totalY + rowHeight)
//     .lineTo(pageMargin + tableWidth, totalY + rowHeight)
//     .stroke();

//   doc.end();
//   return await bufferFromStream(stream);
// };



exports.generatePdfAndUploadInvoice = async (customerDetails, orderId, orderDate, placeOfSupply, placeOfDelivery, items, shippingCharges, totalOrderAmount, invoiceNumber) => {
  try {
    // const browser = await puppeteer.launch({
    //   headless: "new",
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    // const page = await browser.newPage();
    // const htmlContent = await generateInvoiceHtml(customerDetails, orderId, orderDate, placeOfSupply, placeOfDelivery, items, shippingCharges, totalOrderAmount, invoiceNumber);


    const pdfBuffer = await generateInvoicePdfBuffer(customerDetails, orderId, orderDate, placeOfSupply, placeOfDelivery, items, shippingCharges, totalOrderAmount, invoiceNumber);
    // const pdfBuffer = generateStaticInvoicePDF();
    // await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // const pdfBuffer = await page.pdf({
    //   format: "A4",
    //   printBackground: true,
    // });

    // await browser.close();
    const fileName = `${orderId}.pdf`;
    const result = await uploadFile(pdfBuffer, fileName, "application/pdf", "invoices");

    return result;

    // return result; // { Location, Key }
  } catch (error) {
    console.error("❌ Error generating/uploading invoice PDF:", error);
    throw new Error("Invoice PDF generation/upload failed");
  }
};

const generateInvoicePdfBuffer = async (
  customerDetails,
  orderId,
  orderDate,
  placeOfSupply,
  placeOfDelivery,
  items,
  shippingCharges,
  totalOrderAmount,
  invoiceNumber
) => {

  if (!customerDetails || !customerDetails.name) {
    throw new Error("Customer details with name are required");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items array must not be empty");
  }

    function numberToWordsIndian(num) {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function inWords(num) {
      if ((num = num.toString()).length > 9) return "OVERFLOW";
      let n = ("000000000" + num).substr(-9).match(/(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})/);
      if (!n) return "";

      let str = "";
      str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
      str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
      str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
      str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
      str += n[5] != 0 ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";

      return str.trim() + " Only";
    }

    return inWords(num);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true
  });
  const PAGE_TOP = 50;
const PAGE_BOTTOM = doc.page.height - 80;
function redrawTableHeader() {
  doc.rect(tableX, tableY, totalW, rowH).stroke();
  doc.font("DejaVu-Bold").fontSize(7);

  doc.text("Sl No.", tableX + 5, tableY + 6, { width: col.serial });
  doc.text("Item Description", tableX + col.serial + 5, tableY + 6, { width: col.desc });

doc.text(
  "HSN",
  tableX + col.serial + col.desc + 5,
  tableY + 6,
  { width: col.hsn, align: "center" }
);

doc.text(
  "Qty",
  tableX + col.serial + col.desc + col.hsn + 5,
  tableY + 6,
  { width: col.qty }
);

  doc.text("Rate", tableX + col.serial + col.desc + col.hsn+ col.qty + 5, tableY + 6, { width: col.rate });
  doc.text("GST%", tableX + col.serial + col.desc + col.hsn + col.qty + col.rate + 5, tableY + 6, { width: col.gst });
  doc.text("Amount", tableX + col.serial + col.desc + col.hsn + col.qty + col.rate + col.gst + 5, tableY + 6, { width: col.amount });

  tableY += rowH;
}


  doc.registerFont("DejaVu-Bold", path.resolve(__dirname, "font", "DejaVuSans-Bold.ttf"));
  doc.registerFont("DejaVu", path.resolve(__dirname, "font", "DejaVuSans.ttf"));

  const stream = new PassThrough();
  doc.pipe(stream);

  // Logo fetch
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/lmseducationplaform.appspot.com/o/Media%201.png?alt=media&token=ec43244b-eed6-4a25-92a5-9a6694f6b25e";
  let imageBuffer = null;

  try {
    const res = await axios.get(logoUrl, { responseType: "arraybuffer" });
    imageBuffer = Buffer.from(res.data);
  } catch {
    console.log("⚠ Logo failed to load");
  }

  // ================================
  // HEADER (Matches Screenshot)
  // ================================

  doc.font("DejaVu-Bold")
    .fontSize(26)
    .text("Toprise Ventures Pvt Ltd",70,40, { align: "left" });

  doc.moveDown(2);

  const leftText =
    "A924, Tower 3, NX One,\n" +
    "Amrapali Dream Valley,\n" +
    "Greater Noida, Uttar Pradesh";

  const rightText =
    "GSTIN: 09AALCT9093Q1Z2\n" +
    "Phone: +91 91222 21804\n" +
    "Email: support@toprise.in\n" +
    "Website: https://toprise.in/";

  const leftX = 50;
  const leftY = doc.y;

  doc.font("DejaVu").fontSize(11).text(leftText, leftX, leftY);

  const rightX = doc.page.width - doc.page.margins.right - 200;
  doc.text(rightText, rightX, leftY);

  if (imageBuffer) {
    const imgWidth = 90;
    const imgX = doc.page.width - doc.page.margins.right - imgWidth;
    const imgY = leftY - 10;
    doc.image(imageBuffer, imgX, 0, { width: imgWidth });
  }

  doc.moveDown(2);

  // TAX INVOICE Banner
  const barY = doc.y;
  const barW = doc.page.width - 70;

  doc.rect(50, barY, barW, 25).fill("#D3D3D3");
  doc.fillColor("#000").font("DejaVu-Bold").fontSize(14)
    .text("TAX INVOICE", 50, barY + 6, { width: barW, align: "center" });

  doc.fillColor("#000");
  doc.moveDown(2);

  // INVOICE NUMBER
  doc.font("DejaVu-Bold").fontSize(12).text(invoiceNumber.toString());
  doc.moveDown(1);

  // ================================
// CUSTOMER + ORDER DETAILS (Two Column Layout)
// ================================

doc.moveDown(1);

const leftColX = 50;
const rightColX = 300;
let infoY = doc.y;
const lineGap = 18;

doc.font("DejaVu-Bold").fontSize(11);

// LEFT COLUMN (Name, Address, Shipping)
doc.text("Name:", leftColX, infoY);
doc.font("DejaVu").text(customerDetails.name || "N/A", leftColX + 80, infoY);

infoY += lineGap;
doc.font("DejaVu-Bold").text("Shipping Method:", leftColX, infoY);
doc.font("DejaVu").text("N/A", leftColX + 120, infoY);

infoY += lineGap;
doc.font("DejaVu-Bold").text("Address:", leftColX, infoY);
doc.font("DejaVu").text(customerDetails.address || "N/A", leftColX + 80, infoY);



// RIGHT COLUMN (Phone, Email, OrderID, Order Date)
infoY = doc.y - (lineGap * 3); // Reset to align top with Name

doc.font("DejaVu-Bold").text("Phone:", rightColX, infoY);
doc.font("DejaVu").text(customerDetails.phone || "N/A", rightColX + 60, infoY);

infoY += lineGap;
doc.font("DejaVu-Bold").text("Email:", rightColX, infoY);
doc.font("DejaVu").text(customerDetails.email || "N/A", rightColX + 60, infoY);

infoY += lineGap;
doc.font("DejaVu-Bold").text("Order ID:", rightColX, infoY);
doc.font("DejaVu").text(orderId || "N/A", rightColX + 60, infoY);

infoY += lineGap;
doc.font("DejaVu-Bold").text("Order Date :", rightColX, infoY);
doc.font("DejaVu").text(orderDate || "N/A", rightColX + 90, infoY);

doc.moveDown(3);

  //-------------------------------
  // ITEM TABLE
  //-------------------------------

  const tableX = 50;
  let tableY = doc.y;
  const rowH = 22;

  const col = {
  serial: 50,
  desc: 180,
  hsn: 60,
  mpn: 60,
  qty: 40,
  rate: 70,
  gst: 40,
  amount: 100
};


  const totalW =
  col.serial + col.desc + col.hsn + col.qty + col.rate + col.gst + col.amount;


  // HEADER ROW
  doc.rect(tableX, tableY, totalW, rowH).stroke();
  doc.font("DejaVu-Bold").fontSize(7);

  doc.text("Sl No.", tableX + 5, tableY + 6, { width: col.serial });
doc.text("Item Description", tableX + col.serial + 5, tableY + 6, { width: col.desc });

doc.text(
  "HSN",
  tableX + col.serial + col.desc + 5,
  tableY + 6,
  { width: col.hsn, align: "center" }
);

doc.text(
  "Qty",
  tableX + col.serial + col.desc + col.hsn + 5,
  tableY + 6,
  { width: col.qty }
);

doc.text("Rate", tableX + col.serial + col.desc + col.hsn + col.qty + 5, tableY + 6, { width: col.rate });
doc.text("GST%", tableX + col.serial + col.desc + col.hsn + col.qty + col.rate + 5, tableY + 6, { width: col.gst });
doc.text("Amount", tableX + col.serial + col.desc + col.hsn + col.qty + col.rate + col.gst + 5, tableY + 6, { width: col.amount });


  tableY += rowH;

  //-------------------------------
  // SAFE ITEM ROWS
  //-------------------------------

//----------------------------------
  // TAX ACCUMULATION
  //----------------------------------
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let taotalAmount = 0;

  items.forEach((item, i) => {
  console.log("Item:", item);
    const taxPercentage=item.igstPercent>0 ? item.igstPercent : (Number(item.cgstPercent || 0) + Number(item.sgstPercent || 0));

  const qty = isNaN(parseFloat(item.quantity)) ? 0 : parseFloat(item.quantity);
  const rate = isNaN(parseFloat(item.unitPrice)) ? 0 : parseFloat((item.unitPrice-((item.unitPrice/100)*taxPercentage)).toFixed(2));
   const taxable = qty * rate;

    const cgstAmt = Number(item.cgstAmount) || 0;
    const sgstAmt = Number(item.sgstAmount) || 0;
    const igstAmt = Number(item.igstAmount) || 0;

    totalTaxable += taxable;
    totalCGST += cgstAmt;
    totalSGST += sgstAmt;
    totalIGST += igstAmt;


    const amt =  isNaN(parseFloat(item.unitPrice)) ? 0 : (  (qty * item.unitPrice).toFixed(2));
    taotalAmount += amt;
    let gstPercent;
    if(item.cgstPercent>0 && item.sgstPercent>0){
      gstPercent = Number(item.cgstPercent || 0) + Number(item.sgstPercent || 0);
    } else {
      gstPercent = Number(item.igstPercent || 0);
    }
    

  const rH = 90;

// 🔴 ADD THIS BLOCK
if (tableY + rH > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
  redrawTableHeader();
}


  doc.rect(tableX, tableY, totalW, rH).stroke();
  doc.font("DejaVu").fontSize(7);

  //-------------------------------
  // COLUMN 1: SERIAL NUMBER
  //-------------------------------
  doc.text(String(i + 1), tableX + 5, tableY + 5, { width: col.serial });

  //-------------------------------
  // COLUMN 2: DESCRIPTION (WITH SKU, HSN, MPN)
  //-------------------------------
  const descText =
    `${item.productName || "N/A"}\n` +
    `SKU: ${item.sku || "N/A"}\n` +
    // `HSN: ${item.hsn || "—"}\n` +
    `MPN: ${item.mpn || "—"}`;

  doc.text(
    descText,
    tableX + col.serial + 5,
    tableY + 5,
    { width: col.desc, lineGap: 2 }
  );

  doc.text(
  item.hsn || "-",
  tableX + col.serial + col.desc + 5,
  tableY + 5,
  { width: col.hsn, align: "center" }
);

  //-------------------------------
  // COLUMN 3: QTY
  //-------------------------------
  doc.text(
    String(qty),
    tableX + col.serial + col.desc + col.hsn + 5,
    tableY + 5,
    { width: col.qty, align: "left" }
  );

  //-------------------------------
  // COLUMN 4: RATE
  //-------------------------------
  doc.text(
    `₹${(rate).toFixed(2)}`,
    tableX + col.serial + col.desc + col.hsn + col.qty + 5,
    tableY + 5,
    { width: col.rate, align: "left" }
  );

  //-------------------------------
  // COLUMN 5: GST%
  //-------------------------------
  doc.text(
    String(gstPercent),
    tableX + col.serial + col.desc + col.hsn + col.qty + col.rate +5,
    tableY + 5,
    { width: col.gst, align: "left" }
  );

  //-------------------------------
  // COLUMN 6: AMOUNT
  //-------------------------------
  doc.text(
    `₹${amt}`,
    tableX + col.serial + col.desc + col.hsn + col.qty + col.rate + col.gst+5   ,
    tableY +5,
    { width: col.amount, align: "left" }
  );

  tableY += rH;
});
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}


//---------------------------------------------------
// 1️⃣ TOTAL ROW (part of same table)
//---------------------------------------------------
doc.rect(tableX, tableY, totalW, rowH).stroke();
doc.font("DejaVu-Bold").fontSize(7)
  .text("Total", tableX + 5, tableY + 6);

doc.text(`₹${totalOrderAmount.toFixed(2)}`,
  tableX + totalW - 80, tableY + 6,
  { width: 70, align: "right" }
);

tableY += rowH;
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}


//---------------------------------------------------
// 2️⃣ AMOUNT IN WORDS (still same table block)
//---------------------------------------------------
const words = numberToWordsIndian(Math.round(totalOrderAmount));

doc.rect(tableX, tableY, totalW, rowH).stroke();
doc.font("DejaVu-Bold").fontSize(7)
  .text("Amount in words (INR):", tableX + 5, tableY + 6);

doc.font("DejaVu").fontSize(10)
  .text(words, tableX + 180, tableY + 6, { width: totalW - 200 });

tableY += rowH;
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}


//---------------------------------------------------
// 3️⃣ TAX BREAKUP TABLE (same block)
//---------------------------------------------------

const taxRowH = 25;

const tCol = {
  hsn: 70,          // 👈 ADD THIS
  taxable: 100,
  cgstRate: 50,
  cgstAmt: 50,
  sgstRate: 50,
  sgstAmt: 50,
  igstRate: 50,
  igstAmt: 50,
  total: 100
};


const taxWidth = Object.values(tCol).reduce((a, b) => a + b, 0)-30;
let tx = tableX;
let taxY = tableY;

// HEADER ROW
doc.rect(tx, taxY, taxWidth, taxRowH).stroke();
doc.font("DejaVu-Bold").fontSize(6);

let cx = tx;

doc.text("HSN", cx + 5, taxY + 6, { width: tCol.hsn }); 
cx += tCol.hsn;

doc.text("Taxable Value", cx + 5, taxY + 6, { width: tCol.taxable }); 
cx += tCol.taxable;

doc.text("CGST %", cx + 5, taxY + 6, { width: tCol.cgstRate }); cx += tCol.cgstRate;
doc.text("CGST Amt", cx + 5, taxY + 6, { width: tCol.cgstAmt }); cx += tCol.cgstAmt;
doc.text("SGST %", cx + 5, taxY + 6, { width: tCol.sgstRate }); cx += tCol.sgstRate;
doc.text("SGST Amt", cx + 5, taxY + 6, { width: tCol.sgstAmt }); cx += tCol.sgstAmt;
doc.text("IGST %", cx + 5, taxY + 6, { width: tCol.igstRate }); cx += tCol.igstRate;
doc.text("IGST Amt", cx + 5, taxY + 6, { width: tCol.igstAmt }); cx += tCol.igstAmt;
doc.text("Total Tax", cx + 5, taxY + 6, { width: tCol.total });

function redrawTaxTableHeader() {
  // HEADER ROW
doc.rect(tx, taxY, taxWidth, taxRowH).stroke();
doc.font("DejaVu-Bold").fontSize(6);

let cx = tx;

doc.text("HSN", cx + 5, taxY + 6, { width: tCol.hsn }); 
cx += tCol.hsn;

doc.text("Taxable Value", cx + 5, taxY + 6, { width: tCol.taxable }); 
cx += tCol.taxable;

doc.text("CGST %", cx + 5, taxY + 6, { width: tCol.cgstRate }); cx += tCol.cgstRate;
doc.text("CGST Amt", cx + 5, taxY + 6, { width: tCol.cgstAmt }); cx += tCol.cgstAmt;
doc.text("SGST %", cx + 5, taxY + 6, { width: tCol.sgstRate }); cx += tCol.sgstRate;
doc.text("SGST Amt", cx + 5, taxY + 6, { width: tCol.sgstAmt }); cx += tCol.sgstAmt;
doc.text("IGST %", cx + 5, taxY + 6, { width: tCol.igstRate }); cx += tCol.igstRate;
doc.text("IGST Amt", cx + 5, taxY + 6, { width: tCol.igstAmt }); cx += tCol.igstAmt;
doc.text("Total Tax", cx + 5, taxY + 6, { width: tCol.total });
  tableY += rowH;
}
// create a function to draw tax table header

taxY += taxRowH;

items.forEach(item => {
  doc.rect(tx, taxY, taxWidth, taxRowH).stroke();
  doc.font("DejaVu").fontSize(6);
  if (tableY + rowH > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
  redrawTaxTableHeader();
}
const taxPercentage=item.igstPercent>0 ? item.igstPercent : (Number(item.cgstPercent || 0) + Number(item.sgstPercent || 0));

  const taxable = (Number(item.unitPrice-((item.unitPrice/100)*taxPercentage)) || 0) * (Number(item.quantity) || 0);
  const cgstPct = Number(item.cgstPercent) || 0;
  const sgstPct = Number(item.sgstPercent) || 0;
  const igstPct = Number(item.igstPercent) || 0;

  const cgstAmt = Number(item.cgstAmount) || 0;
  const sgstAmt = Number(item.sgstAmount) || 0;
  const igstAmt = Number(item.igstAmount) || 0;
 

  cx = tx;

// HSN COLUMN
doc.text(item.hsn || "-", cx + 5, taxY + 6, { width: tCol.hsn });
cx += tCol.hsn;

// TAXABLE VALUE
doc.text(taxable.toFixed(2), cx + 5, taxY + 6, { width: tCol.taxable });
cx += tCol.taxable;


  doc.text(cgstPct ? `${cgstPct}%` : "-", cx + 5, taxY + 6, { width: tCol.cgstRate });
  cx += tCol.cgstRate;

  doc.text(cgstAmt ? cgstAmt.toFixed(2) : "-", cx + 5, taxY + 6, { width: tCol.cgstAmt });
  cx += tCol.cgstAmt;

  doc.text(sgstPct ? `${sgstPct}%` : "-", cx + 5, taxY + 6, { width: tCol.sgstRate });
  cx += tCol.sgstRate;

  doc.text(sgstAmt ? sgstAmt.toFixed(2) : "-", cx + 5, taxY + 6, { width: tCol.sgstAmt });
  cx += tCol.sgstAmt;

  doc.text(igstPct ? `${igstPct}%` : "-", cx + 5, taxY + 6, { width: tCol.igstRate });
  cx += tCol.igstRate;

  doc.text(igstAmt ? igstAmt.toFixed(2) : "-", cx + 5, taxY + 6, { width: tCol.igstAmt });
  cx += tCol.igstAmt;

  doc.text(
    (cgstAmt + sgstAmt + igstAmt).toFixed(2),
    cx + 5,
    taxY + 6,
    { width: tCol.total }
  );

  taxY += taxRowH;
});

tableY = taxY + taxRowH;
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}
// ================= TOTAL TAX ROW =================
doc.rect(tx, taxY, taxWidth, taxRowH).stroke();
doc.font("DejaVu-Bold").fontSize(6);

let totalCx = tx;

// HSN TOTAL LABEL
doc.text("TOTAL", totalCx + 5, taxY + 6, { width: tCol.hsn });
totalCx += tCol.hsn;

// TAXABLE TOTAL
doc.text(
  (totalTaxable).toFixed(2),
  totalCx + 5,
  taxY + 6,
  { width: tCol.taxable }
);
totalCx += tCol.taxable;

// CGST %
doc.text("-", totalCx + 5, taxY + 6, { width: tCol.cgstRate });
totalCx += tCol.cgstRate;

// CGST AMT
doc.text(
  totalCGST.toFixed(2),
  totalCx + 5,
  taxY + 6,
  { width: tCol.cgstAmt }
);
totalCx += tCol.cgstAmt;

// SGST %
doc.text("-", totalCx + 5, taxY + 6, { width: tCol.sgstRate });
totalCx += tCol.sgstRate;

// SGST AMT
doc.text(
  totalSGST.toFixed(2),
  totalCx + 5,
  taxY + 6,
  { width: tCol.sgstAmt }
);
totalCx += tCol.sgstAmt;

// IGST %
doc.text("-", totalCx + 5, taxY + 6, { width: tCol.igstRate });
totalCx += tCol.igstRate;

// IGST AMT
doc.text(
  totalIGST.toFixed(2),
  totalCx + 5,
  taxY + 6,
  { width: tCol.igstAmt }
);
totalCx += tCol.igstAmt;

// GRAND TAX TOTAL
doc.text(
  (totalCGST + totalSGST + totalIGST).toFixed(2),
  totalCx + 5,
  taxY + 6,
  { width: tCol.total }
);

taxY += taxRowH;


tableY = taxY ;
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}


//---------------------------------------------------
// 4️⃣ TAX AMOUNT IN WORDS (still table block)
//---------------------------------------------------
doc.rect(tableX, tableY, totalW, rowH).stroke();

doc.font("DejaVu-Bold").fontSize(6)
  .text("Tax amount in words:", tableX + 5, tableY + 6);

doc.font("DejaVu").fontSize(6)
  .text(numberToWordsIndian(Math.round(totalCGST + totalSGST + totalIGST)),
        tableX + 180, tableY + 6, { width: totalW - 200 });

tableY += rowH;
if (tableY + 120 > PAGE_BOTTOM) {
  doc.addPage();
  tableY = PAGE_TOP;
}


//---------------------------------------------------
// 5️⃣ TERMS + SIGNATORY (full width box)
//---------------------------------------------------
const boxHeight = 150;

// Outer box
doc.rect(50, tableY, totalW, boxHeight).stroke();

// ✅ Vertical divider
const splitX = 50 + totalW * 0.6;
doc.moveTo(splitX, tableY)
   .lineTo(splitX, tableY + boxHeight)
   .stroke();

// LEFT: Terms
doc.font("DejaVu-Bold").fontSize(9)
  .text("Terms & Conditions", 50, tableY + 10, {
    width: totalW * 0.6,
    align: "center"
  });

doc.font("DejaVu").fontSize(7)
  .text(
    "1. For full Terms & Conditions, Shipping Policy & Privacy Policy, please visit our website.\n" +
    "2. Return Policy is valid for 14 days subject to inspection.\n" +
    "3. This invoice shows actual price and all particulars are true.",
    55,
    tableY + 35,
    { width: totalW * 0.6 - 10 }
  );

// RIGHT: Authorised Signatory
doc.font("DejaVu-Bold").fontSize(9)
  .text(
    "Authorised Signatory",
    splitX,
    tableY + 10,
    { width: totalW * 0.4, align: "center" }
  );

doc.font("DejaVu").fontSize(7)
  .text(
    "This is a computer-generated invoice; signature not required.",
    splitX + 5,
    tableY + boxHeight - 100,
    { width: totalW * 0.4 - 10, align: "center" }
  );

  //----------------------------------
  // END PDF
  //----------------------------------
  doc.end();
  return bufferFromStream(stream);
};