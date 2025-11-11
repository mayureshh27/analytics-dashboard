// File: apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Define a type for the expected JSON structure (simplified)
type RawDoc = {
  _id: string;
  status: string;
  createdAt: { $date: string };
  extractedData?: {
    llmData?: {
      invoice: {
        value: {
          invoiceId: { value: string };
          invoiceDate: { value: string };
          deliveryDate?: { value: string };
        };
      };
      vendor: {
        value: {
          vendorName: { value: string };
          vendorAddress?: { value: string };
          vendorTaxId?: { value: string };
          vendorPartyNumber?: { value: string };
        };
      };
      customer: {
        value: {
          customerName: { value: string };
          customerAddress?: { value: string };
        };
      };
      payment?: {
        value: {
          dueDate?: { value: string };
          paymentTerms?: { value: string };
          bankAccountNumber?: { value: string };
        };
      };
      summary: {
        value: {
          documentType?: { value: string };
          subTotal?: { value: number };
          totalTax?: { value: number };
          invoiceTotal: { value: number };
          currencySymbol?: { value: string };
        };
      };
      lineItems?: {
        value: {
          items: {
            value: Array<{
              description?: { value: string };
              quantity?: { value: number };
              unitPrice?: { value: number };
              totalPrice?: { value: number };
              // --- FIXED: Types updated to accept string or number ---
              Sachkonto?: { value: string | number };
              BUSchluessel?: { value: string | number };
            }>;
          };
        };
      };
    };
  };
};

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data in the correct order
  console.log('Clearing old data...');
  await prisma.lineItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();

  // 2. Read the JSON file
  const jsonPath = path.join(
      process.cwd(),
      '..', // up from /api
      '..', // up from /apps
      'data',
      'Analytics_Test_Data.json',
  );

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: JSON file not found at ${jsonPath}`);
    console.log(`Current working directory: ${process.cwd()}`);
    return;
  }
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const rawData: RawDoc[] = JSON.parse(fileContent);

  console.log(`Found ${rawData.length} documents to process...`);

  let createdCount = 0;
  let skippedCount = 0;

  // 3. Loop and create records
  for (const doc of rawData) {
    const llm = doc.extractedData?.llmData;

    // Validation check (now pointing to the correct summary path)
    if (
        !llm ||
        !llm.invoice?.value?.invoiceId?.value ||
        !llm.invoice?.value?.invoiceDate?.value ||
        !llm.summary?.value?.invoiceTotal?.value
    ) {
      console.warn(
          `Skipping document (ID: ${doc._id}) due to missing essential data (invoiceId, invoiceDate, or invoiceTotal).`,
      );
      skippedCount++;
      continue;
    }

    try {
      const vendorName = llm.vendor?.value?.vendorName?.value || 'Unknown Vendor';
      const customerName =
          llm.customer?.value?.customerName?.value || 'Unknown Customer';

      // --- Create Line Items (in memory) ---
      const lineItemsToCreate = [];

      const itemsArray = llm.lineItems?.value?.items?.value;

      if (itemsArray && Array.isArray(itemsArray)) {
        for (const item of itemsArray) {
          // --- FIXED: Explicitly cast Sachkonto to string ---
          const categoryCode = String(item.Sachkonto?.value || 'UNKNOWN');

          lineItemsToCreate.push({
            description: item.description?.value,
            quantity: item.quantity?.value,
            unitPrice: item.unitPrice?.value,
            totalPrice: item.totalPrice?.value,
            // --- FIXED: Explicitly cast BUSchluessel to string or null ---
            buKey: item.BUSchluessel?.value
                ? String(item.BUSchluessel.value)
                : null,
            category: {
              connectOrCreate: {
                where: { code: categoryCode },
                create: { code: categoryCode },
              },
            },
          });
        }
      }

      // --- Create the Invoice and connect everything ---
      await prisma.invoice.create({
        data: {
          documentId: doc._id,
          status: doc.status,
          createdAt: new Date(doc.createdAt.$date),
          invoiceNumber: llm.invoice.value.invoiceId.value,
          invoiceDate: new Date(llm.invoice.value.invoiceDate.value),
          deliveryDate: llm.invoice.value.deliveryDate?.value
              ? new Date(llm.invoice.value.deliveryDate.value)
              : null,
          subTotal: llm.summary.value.subTotal?.value,
          totalTax: llm.summary.value.totalTax?.value,
          invoiceTotal: llm.summary.value.invoiceTotal.value,
          currencySymbol: llm.summary.value.currencySymbol?.value,
          documentType: llm.summary.value.documentType?.value,

          vendor: {
            connectOrCreate: {
              where: { name: vendorName },
              create: {
                name: vendorName,
                address: llm.vendor?.value?.vendorAddress?.value,
                taxId: llm.vendor?.value?.vendorTaxId?.value,
                partyNumber: llm.vendor?.value?.vendorPartyNumber?.value,
              },
            },
          },

          customer: {
            connectOrCreate: {
              where: { name: customerName },
              create: {
                name: customerName,
                address: llm.customer?.value?.customerAddress?.value,
              },
            },
          },

          payment: llm.payment
              ? {
                create: {
                  dueDate: llm.payment.value.dueDate?.value
                      ? new Date(llm.payment.value.dueDate.value)
                      : null,
                  paymentTerms: llm.payment.value.paymentTerms?.value,
                  bankAccountNumber:
                  llm.payment.value.bankAccountNumber?.value,
                },
              }
              : undefined,

          lineItems: {
            create: lineItemsToCreate,
          },
        },
      });

      createdCount++;
    } catch (e) {
      console.error(
          `Failed to process document (ID: ${doc._id}). Error: ${
              (e as Error).message
          }`,
      );
    }
  }

  console.log('--- Seeding Finished ---');
  console.log(`✅ Successfully created ${createdCount} invoices.`);
  console.log(`⚠️ Skipped ${skippedCount} documents due to missing data.`);
}

main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });