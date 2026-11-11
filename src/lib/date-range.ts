export function periodStart(period:string){const days=period==="day"?1:period==="week"?7:period==="month"?30:0;return days?new Date(Date.now()-days*24*60*60*1000).toISOString():undefined;}
