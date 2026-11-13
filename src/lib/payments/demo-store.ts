type DemoOrder={amountPaise:number;causePreference:"education"|"healthcare"|"animalWelfare"|"other"|"none"|null;createdAt:number;status:"created"|"pending"|"successful"|"failed";receiptToken:string};

// Next.js compiles route handlers and pages into separate module instances, so a plain
// module-level Map is not shared between them. Hang the store on globalThis so every
// bundle in the same server process reads the same map.
const globalStore = globalThis as typeof globalThis & { __justgiveDemoOrders?: Map<string, DemoOrder> };
const orders: Map<string, DemoOrder> = globalStore.__justgiveDemoOrders ?? new Map<string, DemoOrder>();
globalStore.__justgiveDemoOrders = orders;

export function registerDemoOrder(id:string,amountPaise:number,causePreference:DemoOrder["causePreference"]=null){orders.set(id,{amountPaise,causePreference,createdAt:Date.now(),status:"created",receiptToken:crypto.randomUUID()});}
export function completeDemoOrder(id:string,amountPaise:number,outcome:"success"|"pending"|"failed"){
  const order=orders.get(id);if(!order||Date.now()-order.createdAt>30*60_000)return {ok:false as const,reason:"unknown" as const};
  if(order.amountPaise!==amountPaise)return {ok:false as const,reason:"amount" as const};
  if(order.status==="successful"||order.status==="failed")return {ok:false as const,reason:"duplicate" as const};
  order.status=outcome==="success"?"successful":outcome;return {ok:true as const,status:order.status,receiptToken:outcome==="success"?order.receiptToken:null};
}
/** Returns the receipt for a successfully completed demo order. Simulated only. */
export function readDemoReceipt(id:string){const order=orders.get(id);if(!order||order.status!=="successful")return null;return {amountPaise:order.amountPaise,causePreference:order.causePreference,receiptToken:order.receiptToken};}