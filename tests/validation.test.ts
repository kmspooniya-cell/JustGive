import {describe,it,expect} from "vitest";
import {amountSchema,messageSchema,contactSchema,paymentOrderSchema} from "../src/lib/validation";
describe("contribution and public form validation",()=>{
  it("accepts rupee limits represented in paise",()=>{expect(amountSchema.safeParse(100).success).toBe(true);expect(amountSchema.safeParse(10_000_000).success).toBe(true);});
  it("rejects fractional or out of range paise",()=>{for(const value of [99,100.2,10_000_001,NaN])expect(amountSchema.safeParse(value).success).toBe(false);});
  it("validates optional cause preferences server-side",()=>{expect(paymentOrderSchema.safeParse({amountPaise:100}).success).toBe(true);expect(paymentOrderSchema.safeParse({amountPaise:100,causePreference:null}).success).toBe(true);for(const causePreference of ["education","healthcare","animalWelfare","other","none"])expect(paymentOrderSchema.safeParse({amountPaise:100,causePreference}).success).toBe(true);expect(paymentOrderSchema.safeParse({amountPaise:100,causePreference:"charity"}).success).toBe(false);});
  it("keeps messages anonymous and requires explicit consent only for publication",()=>{const result=messageSchema.parse({message:"  नमस्ते  ",publishConsent:false,locale:"hi"});expect(result.message).toBe("नमस्ते");expect(result.publishConsent).toBe(false);});
  it("rejects messages over 300 characters",()=>{expect(messageSchema.safeParse({message:"x".repeat(301)}).success).toBe(false);});
  it("validates contact form email and body",()=>{expect(contactSchema.safeParse({name:"A",email:"a@example.com",message:"A long enough message"}).success).toBe(true);expect(contactSchema.safeParse({name:"",email:"bad",message:"x"}).success).toBe(false);});
  it("accepts all supported contact locales and rejects unknown locale values",()=>{for(const locale of ["en","hi","hi-Latn"])expect(contactSchema.safeParse({name:"A",email:"a@example.com",message:"A long enough message",locale}).success).toBe(true);expect(contactSchema.safeParse({name:"A",email:"a@example.com",message:"A long enough message",locale:"fr"}).success).toBe(false);});
});
