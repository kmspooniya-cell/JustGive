type DemoOrder={amountPaise:number;createdAt:number;status:"created"|"pending"|"successful"|"failed"};
const orders=new Map<string,DemoOrder>();
export function registerDemoOrder(id:string,amountPaise:number){orders.set(id,{amountPaise,createdAt:Date.now(),status:"created"});}
export function completeDemoOrder(id:string,amountPaise:number,outcome:"success"|"pending"|"failed"){
  const order=orders.get(id);if(!order||Date.now()-order.createdAt>30*60_000)return {ok:false as const,reason:"unknown" as const};
  if(order.amountPaise!==amountPaise)return {ok:false as const,reason:"amount" as const};
  if(order.status==="successful"||order.status==="failed")return {ok:false as const,reason:"duplicate" as const};
  order.status=outcome==="success"?"successful":outcome;return {ok:true as const,status:order.status};
}
