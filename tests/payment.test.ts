import {describe,it,expect} from "vitest";
import {MockPaymentProvider} from "../src/lib/payments/mock-provider";
import {completeDemoOrder,registerDemoOrder} from "../src/lib/payments/demo-store";
describe("development-only mock payment adapter",()=>{
  it("creates a visibly simulated INR order",async()=>{const order=await new MockPaymentProvider().createOrder({internalOrderId:"jg_test",amountPaise:2100,currency:"INR"});expect(order.simulated).toBe(true);expect(order.orderId).toContain("demo_");expect(order.amountPaise).toBe(2100);});
  it("does not accept arbitrary webhook signatures",async()=>{expect(await new MockPaymentProvider().verifyWebhook("{}","anything")).toBe(false);});
  it("requires an existing order and exact amount, then prevents duplicate completion",()=>{expect(completeDemoOrder("missing",100,"success").ok).toBe(false);registerDemoOrder("order-a",2100);expect(completeDemoOrder("order-a",2000,"success").ok).toBe(false);expect(completeDemoOrder("order-a",2100,"success")).toEqual({ok:true,status:"successful",receiptToken:expect.any(String)});expect(completeDemoOrder("order-a",2100,"success").ok).toBe(false);});
  it("supports a pending simulation before a successful result",()=>{registerDemoOrder("order-b",100);expect(completeDemoOrder("order-b",100,"pending")).toEqual({ok:true,status:"pending",receiptToken:null});expect(completeDemoOrder("order-b",100,"success")).toEqual({ok:true,status:"successful",receiptToken:expect.any(String)});});
});
