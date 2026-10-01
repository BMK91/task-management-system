import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

interface ExportTask {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const formatDate = (date?: Date | null): string => {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Generate Excel workbook containing tasks.
 */
export const generateTasksExcel = async (
  tasks: ExportTask[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Task Management System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Tasks");

  worksheet.columns = [
    {
      header: "Title",
      key: "title",
      width: 30,
    },
    {
      header: "Description",
      key: "description",
      width: 45,
    },
    {
      header: "Status",
      key: "status",
      width: 18,
    },
    {
      header: "Priority",
      key: "priority",
      width: 15,
    },
    {
      header: "Due Date",
      key: "dueDate",
      width: 15,
    },
    {
      header: "Created At",
      key: "createdAt",
      width: 22,
    },
    {
      header: "Updated At",
      key: "updatedAt",
      width: 22,
    },
  ];

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  tasks.forEach((task) => {
    worksheet.addRow({
      title: task.title,
      description: task.description || "-",
      status: task.status,
      priority: task.priority,
      dueDate: formatDate(task.dueDate),
      createdAt: formatDateTime(task.createdAt),
      updatedAt: formatDateTime(task.updatedAt),
    });
  });

  worksheet.autoFilter = {
    from: "A1",
    to: "G1",
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = {
        vertical: "top",
        wrapText: true,
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};

const drawPageNumbers = (doc: InstanceType<typeof PDFDocument>): void => {
  const pageRange = doc.bufferedPageRange();

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const footerY = doc.page.height - 30;

  for (
    let page = pageRange.start;
    page < pageRange.start + pageRange.count;
    page += 1
  ) {
    doc.switchToPage(page);

    doc
      .save()
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#6C757D")
      .text(
        `Page ${page - pageRange.start + 1} of ${pageRange.count}`,
        doc.page.margins.left,
        footerY,
        {
          width: pageWidth,
          height: 10,
          align: "center",
          lineBreak: false,
        },
      )
      .restore();
  }
};

export const generateTasksPdf = (tasks: ExportTask[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 35,
        left: 30,
        right: 30,
        bottom: 45,
      },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    /*
     * ------------------------------------------------------------------
     * Report Header
     * ------------------------------------------------------------------
     */

    doc.font("Helvetica-Bold").fontSize(20).text("Task Report", {
      align: "left",
    });

    doc.moveDown(0.25);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#666666")
      .text(`Generated on ${formatDateTime(new Date())}`, {
        align: "left",
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#666666")
      .text(`${tasks.length} task${tasks.length === 1 ? "" : "s"}`, {
        align: "left",
      });

    doc.moveDown(1);

    /*
     * ------------------------------------------------------------------
     * Table Configuration
     * ------------------------------------------------------------------
     *
     * Widths are percentages of the complete usable A4 width.
     */
    const columns = [
      {
        key: "title",
        header: "Title",
        width: pageWidth * 0.28,
        align: "left" as const,
      },
      {
        key: "status",
        header: "Status",
        width: pageWidth * 0.15,
        align: "center" as const,
      },
      {
        key: "priority",
        header: "Priority",
        width: pageWidth * 0.12,
        align: "center" as const,
      },
      {
        key: "dueDate",
        header: "Due Date",
        width: pageWidth * 0.14,
        align: "center" as const,
      },
      {
        key: "createdAt",
        header: "Created",
        width: pageWidth * 0.155,
        align: "center" as const,
      },
      {
        key: "updatedAt",
        header: "Updated",
        width: pageWidth * 0.155,
        align: "center" as const,
      },
    ] as const;

    const headerHeight = 30;
    const rowHeight = 30;

    let y = doc.y;

    /*
     * ------------------------------------------------------------------
     * Table Header
     * ------------------------------------------------------------------
     */

    const drawTableHeader = (): void => {
      let x = doc.page.margins.left;

      columns.forEach((column) => {
        doc
          .save()
          .rect(x, y, column.width, headerHeight)
          .fillAndStroke("#E9ECEF", "#B8BEC5");

        doc
          .fillColor("#212529")
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .text(column.header, x + 6, y + 10, {
            width: column.width - 12,
            align: column.align,
            lineBreak: false,
          })
          .restore();

        x += column.width;
      });

      y += headerHeight;
    };

    /*
     * ------------------------------------------------------------------
     * Empty State
     * ------------------------------------------------------------------
     */

    if (tasks.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#666666")
        .text("No tasks found.", {
          align: "center",
        });

      drawPageNumbers(doc);
      doc.end();
      return;
    }

    drawTableHeader();

    /*
     * ------------------------------------------------------------------
     * Table Rows
     * ------------------------------------------------------------------
     */

    tasks.forEach((task, index) => {
      const footerSpace = 45;

      if (y + rowHeight > doc.page.height - footerSpace) {
        doc.addPage();

        y = doc.page.margins.top;

        drawTableHeader();
      }

      const rowBackground = index % 2 === 0 ? "#FFFFFF" : "#F8F9FA";

      let x = doc.page.margins.left;

      const values = [
        task.title || "-",
        task.status || "-",
        task.priority || "-",
        formatDate(task.dueDate),
        formatDate(task.createdAt),
        formatDate(task.updatedAt),
      ];

      columns.forEach((column, columnIndex) => {
        const value = values[columnIndex] ?? "-";

        /*
         * Cell background + border
         */
        doc
          .save()
          .rect(x, y, column.width, rowHeight)
          .fillAndStroke(rowBackground, "#D9DEE3");

        /*
         * Status / priority visual emphasis
         */
        let textColor = "#343A40";

        if (column.key === "status") {
          if (task.status === "Completed") {
            textColor = "#198754";
          } else if (task.status === "In Progress") {
            textColor = "#0D6EFD";
          } else if (task.status === "Pending") {
            textColor = "#856404";
          }
        }

        if (column.key === "priority") {
          if (task.priority === "High") {
            textColor = "#DC3545";
          } else if (task.priority === "Medium") {
            textColor = "#FD7E14";
          } else if (task.priority === "Low") {
            textColor = "#198754";
          }
        }

        doc
          .fillColor(textColor)
          .font(
            column.key === "status" || column.key === "priority"
              ? "Helvetica-Bold"
              : "Helvetica",
          )
          .fontSize(8)
          .text(value, x + 6, y + 9, {
            width: column.width - 12,
            height: rowHeight - 10,
            align: column.align,
            ellipsis: true,
            lineBreak: false,
          })
          .restore();

        x += column.width;
      });

      y += rowHeight;
    });

    /*
     * ------------------------------------------------------------------
     * Footer / Page Numbers
     * ------------------------------------------------------------------
     */

    drawPageNumbers(doc);

    doc.end();
  });
};
