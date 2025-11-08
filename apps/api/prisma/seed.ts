import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'Analytics_Test_Data.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  for (const item of data) {
    const extractedData = item.extractedData?.llmData;
    if (!extractedData) continue;

    let vendor;
    if (extractedData.vendor?.value) {
      vendor = await prisma.vendor.create({
        data: {
          name: extractedData.vendor.value.vendorName?.value,
          partyNumber: extractedData.vendor.value.vendorPartyNumber?.value,
          address: extractedData.vendor.value.vendorAddress?.value,
          taxId: extractedData.vendor.value.vendorTaxId?.value,
        },
      });
    }

    let customer;
    if (extractedData.customer?.value) {
      customer = await prisma.customer.create({
        data: {
          name: extractedData.customer.value.customerName?.value,
          address: extractedData.customer.value.customerAddress?.value,
        },
      });
    }

    let payment;
    if (extractedData.payment?.value) {
      payment = await prisma.payment.create({
        data: {
          dueDate: extractedData.payment.value.dueDate?.value ? new Date(extractedData.payment.value.dueDate.value) : null,
          paymentTerms: extractedData.payment.value.paymentTerms?.value,
          bankAccountNumber: extractedData.payment.value.bankAccountNumber?.value,
          bic: extractedData.payment.value.BIC?.value,
          accountName: extractedData.payment.value.accountName?.value,
          netDays: extractedData.payment.value.netDays?.value,
          discountPercentage: typeof extractedData.payment.value.discountPercentage?.value === 'number' ? extractedData.payment.value.discountPercentage?.value : null,
          discountDays: extractedData.payment.value.discountDays?.value,
          discountDueDate: extractedData.payment.value.discountDueDate?.value ? new Date(extractedData.payment.value.discountDueDate.value) : null,
          discountedTotal: typeof extractedData.payment.value.discountedTotal?.value === 'number' ? extractedData.payment.value.discountedTotal?.value : null,
        },
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceId: extractedData.invoice?.value.invoiceId?.value,
        invoiceDate: extractedData.invoice?.value.invoiceDate?.value ? new Date(extractedData.invoice.value.invoiceDate.value) : null,
        deliveryDate: extractedData.invoice?.value.deliveryDate?.value ? new Date(extractedData.invoice.value.deliveryDate.value) : null,
        subTotal: typeof extractedData.summary?.value?.subTotal?.value === 'number' ? extractedData.summary.value.subTotal.value : null,
        totalTax: typeof extractedData.summary?.value?.totalTax?.value === 'number' ? extractedData.summary.value.totalTax.value : null,
        invoiceTotal: typeof extractedData.summary?.value?.invoiceTotal?.value === 'number' ? extractedData.summary.value.invoiceTotal.value : null,
        currencySymbol: extractedData.summary?.value?.currencySymbol?.value,
        documentType: extractedData.summary?.value?.documentType?.value,
        status: item.status,
        vendorId: vendor?.id,
        customerId: customer?.id,
        paymentId: payment?.id,
      },
    });

    if (extractedData.lineItems?.value?.items && Array.isArray(extractedData.lineItems.value.items)) {
      for (const lineItem of extractedData.lineItems.value.items) {
        await prisma.lineItem.create({
          data: {
            srNo: lineItem.srNo?.value,
            description: lineItem.description?.value,
            quantity: typeof lineItem.quantity?.value === 'number' ? lineItem.quantity.value : null,
            unitPrice: typeof lineItem.unitPrice?.value === 'number' ? lineItem.unitPrice.value : null,
            totalPrice: typeof lineItem.totalPrice?.value === 'number' ? lineItem.totalPrice.value : null,
            sachkonto: lineItem.Sachkonto?.value,
            buSchluessel: lineItem.BUSchluessel?.value,
            invoiceId: invoice.id,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
