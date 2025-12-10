import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { InvoiceService } from "./invoice-service";
import { invoiceApi } from "../api/invoice-api";
import type { Invoice, InvoiceStatus } from "../types/invoice-types";

// Mock the invoice API
vi.mock("../api/invoice-api", () => ({
  invoiceApi: {
    generateInvoice: vi.fn(),
  },
}));

/**
 * **Feature: subscription-and-billing, Property 21: Automatic Invoice Generation**
 *
 * Property: For any billing period end, the system should generate invoices automatically
 * with subscription charges, usage overages, and applicable taxes
 *
 * **Validates: Requirements 5.1**
 */
describe("Invoice Generation Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Property 21: Automatic Invoice Generation", () => {
    it("should generate valid invoices for any billing period end with required components", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary subscription IDs (UUIDs)
          fc.uuid(),
          // Generate arbitrary future dates for period end (within reasonable range)
          fc
            .date({
              min: new Date(Date.now() + 24 * 60 * 60 * 1000), // At least 1 day in future
              max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // At most 1 year in future
            })
            .filter((date) => !isNaN(date.getTime())), // Filter out invalid dates
          // Generate arbitrary subscription charges
          fc.float({
            min: Math.fround(0.01),
            max: Math.fround(10000),
            noNaN: true,
          }),
          // Generate arbitrary usage overages
          fc.float({
            min: Math.fround(0),
            max: Math.fround(5000),
            noNaN: true,
          }),
          // Generate arbitrary tax rates
          fc.float({ min: Math.fround(0), max: Math.fround(0.3), noNaN: true }),
          async (
            subscriptionId,
            periodEnd,
            subscriptionCharge,
            usageOverage,
            taxRate
          ) => {
            // Calculate expected amounts
            const subtotal = subscriptionCharge + usageOverage;
            const taxAmount = subtotal * taxRate;
            const totalAmount = subtotal + taxAmount;

            // Mock the API response with a valid invoice
            const mockInvoice: Invoice = {
              id: fc.sample(fc.uuid(), 1)[0],
              tenantId: fc.sample(fc.uuid(), 1)[0],
              subscriptionId,
              number: `INV-${Date.now()}`,
              status: "open" as InvoiceStatus,
              amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
              currency: "USD",
              dueDate: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after period end
              lineItems: [
                {
                  description: "Subscription charge",
                  amount: Math.round(subscriptionCharge * 100) / 100,
                  quantity: 1,
                  unitPrice: Math.round(subscriptionCharge * 100) / 100,
                  period: {
                    start: new Date(
                      periodEnd.getTime() - 30 * 24 * 60 * 60 * 1000
                    ),
                    end: periodEnd,
                  },
                },
                ...(usageOverage > 0
                  ? [
                      {
                        description: "Usage overage",
                        amount: Math.round(usageOverage * 100) / 100,
                        quantity: 1,
                        unitPrice: Math.round(usageOverage * 100) / 100,
                      },
                    ]
                  : []),
                ...(taxAmount > 0
                  ? [
                      {
                        description: "Tax",
                        amount: Math.round(taxAmount * 100) / 100,
                        quantity: 1,
                        unitPrice: Math.round(taxAmount * 100) / 100,
                      },
                    ]
                  : []),
              ],
              paymentAttempts: [],
              createdAt: new Date(),
            };

            vi.mocked(invoiceApi.generateInvoice).mockResolvedValue(
              mockInvoice
            );

            // Call the service method
            const result = await InvoiceService.generateInvoice(
              subscriptionId,
              periodEnd
            );

            // Verify the API was called with correct parameters
            expect(invoiceApi.generateInvoice).toHaveBeenCalledWith(
              subscriptionId,
              periodEnd
            );

            // Property assertions: Generated invoice must have required components

            // 1. Invoice must have subscription charges
            const subscriptionLineItems = result.lineItems.filter((item) =>
              item.description.toLowerCase().includes("subscription")
            );
            expect(subscriptionLineItems.length).toBeGreaterThan(0);

            // 2. If there are usage overages, they must be included
            if (usageOverage > 0) {
              const usageLineItems = result.lineItems.filter(
                (item) =>
                  item.description.toLowerCase().includes("usage") ||
                  item.description.toLowerCase().includes("overage")
              );
              expect(usageLineItems.length).toBeGreaterThan(0);
            }

            // 3. If there are taxes, they must be included
            if (taxAmount > 0) {
              const taxLineItems = result.lineItems.filter((item) =>
                item.description.toLowerCase().includes("tax")
              );
              expect(taxLineItems.length).toBeGreaterThan(0);
            }

            // 4. Invoice must have valid structure
            expect(result.id).toBeDefined();
            expect(result.tenantId).toBeDefined();
            expect(result.subscriptionId).toBe(subscriptionId);
            expect(result.number).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.amount).toBeGreaterThan(0);
            expect(result.currency).toBeDefined();
            expect(result.dueDate).toBeInstanceOf(Date);
            expect(result.lineItems).toBeDefined();
            expect(result.lineItems.length).toBeGreaterThan(0);
            expect(result.createdAt).toBeInstanceOf(Date);

            // 5. Line items must sum to total amount (within rounding tolerance)
            const lineItemTotal = result.lineItems.reduce(
              (sum, item) => sum + item.amount,
              0
            );
            const roundedLineItemTotal = Math.round(lineItemTotal * 100) / 100;
            const roundedInvoiceAmount = Math.round(result.amount * 100) / 100;
            expect(
              Math.abs(roundedLineItemTotal - roundedInvoiceAmount)
            ).toBeLessThanOrEqual(0.02);

            // 6. Each line item must have required fields
            result.lineItems.forEach((item) => {
              expect(item.description).toBeDefined();
              expect(typeof item.description).toBe("string");
              expect(item.description.length).toBeGreaterThan(0);
              expect(item.amount).toBeGreaterThanOrEqual(0);
              expect(item.quantity).toBeGreaterThan(0);
              expect(item.unitPrice).toBeGreaterThanOrEqual(0);
            });

            // 7. Due date must be after period end
            expect(result.dueDate.getTime()).toBeGreaterThan(
              periodEnd.getTime()
            );

            // 8. Invoice must be in valid initial status
            expect(["draft", "open"]).toContain(result.status);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design document
      );
    });

    it("should handle edge cases for invoice generation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc
            .date({
              min: new Date(Date.now() + 60 * 1000), // At least 1 minute in future
              max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // At most 30 days in future
            })
            .filter((date) => !isNaN(date.getTime())), // Filter out invalid dates
          async (subscriptionId, periodEnd) => {
            // Mock minimal valid invoice
            const mockInvoice: Invoice = {
              id: fc.sample(fc.uuid(), 1)[0],
              tenantId: fc.sample(fc.uuid(), 1)[0],
              subscriptionId,
              number: `INV-${Date.now()}`,
              status: "draft" as InvoiceStatus,
              amount: 0.01, // Minimum amount
              currency: "USD",
              dueDate: new Date(periodEnd.getTime() + 24 * 60 * 60 * 1000),
              lineItems: [
                {
                  description: "Minimum charge",
                  amount: 0.01,
                  quantity: 1,
                  unitPrice: 0.01,
                },
              ],
              paymentAttempts: [],
              createdAt: new Date(),
            };

            vi.mocked(invoiceApi.generateInvoice).mockResolvedValue(
              mockInvoice
            );

            const result = await InvoiceService.generateInvoice(
              subscriptionId,
              periodEnd
            );

            // Even minimal invoices must have required structure
            expect(result.id).toBeDefined();
            expect(result.subscriptionId).toBe(subscriptionId);
            expect(result.amount).toBeGreaterThan(0);
            expect(result.lineItems.length).toBeGreaterThan(0);
            expect(result.dueDate.getTime()).toBeGreaterThan(
              periodEnd.getTime()
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should validate input parameters correctly", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(""), // Empty string
            fc.constant(null), // Null
            fc.constant(undefined) // Undefined
          ),
          fc.date(),
          async (invalidSubscriptionId, periodEnd) => {
            // Should throw error for invalid subscription ID
            await expect(
              InvoiceService.generateInvoice(
                invalidSubscriptionId as any,
                periodEnd
              )
            ).rejects.toThrow("Subscription ID is required");
          }
        ),
        { numRuns: 20 }
      );

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.oneof(
            fc.constant(null), // Null
            fc.constant(undefined), // Undefined
            fc.date({ max: new Date() }) // Past date
          ),
          async (subscriptionId, invalidPeriodEnd) => {
            if (invalidPeriodEnd === null || invalidPeriodEnd === undefined) {
              // Should throw error for missing period end
              await expect(
                InvoiceService.generateInvoice(
                  subscriptionId,
                  invalidPeriodEnd as any
                )
              ).rejects.toThrow("Period end date is required");
            } else {
              // Should throw error for past date
              await expect(
                InvoiceService.generateInvoice(subscriptionId, invalidPeriodEnd)
              ).rejects.toThrow("Period end date must be in the future");
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
