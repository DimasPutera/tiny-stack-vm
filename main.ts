import {existsSync,mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input';
const O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
function run(p:Buffer,inp:Buffer):[Buffer,number]{
 const m=new Int32Array(256),s:number[]=[],c:number[]=[],o:number[]=[];
 let pc=0,ip=0,n=0;
 while(true){
  if(n>=1000000)return[Buffer.from(o),10];
  if(pc<0||pc>=p.length)return[Buffer.from(o),9];
  const op=p[pc]!;
  if(!(op<=7||(op>=16&&op<=34)||(op>=48&&op<=52)||(op>=64&&op<=65)||(op>=80&&op<=83)))return[Buffer.from(o),5];
  const il=op===1?1:op===2?4:op>=48&&op<=51?2:0;
  if(pc+1+il>p.length)return[Buffer.from(o),9];
  let k=0,a=0;
  if(op===1||op===2||op===82)a=1;
  else if(op===3)k=1;
  else if(op===4){k=1;a=2}
  else if(op===5){k=2;a=2}
  else if(op===6){k=2;a=3}
  else if(op===7){k=3;a=3}
  else if(op>=16&&op<=34&&op!==23&&op!==27){k=2;a=1}
  else if(op===23||op===27){k=1;a=1}
  else if(op===49||op===50||op===64)k=1;
  else if(op===65)k=2;
  else if(op>=80&&op<=83)k=1;
  if(s.length<k)return[Buffer.from(o),2];
  if(s.length-k+a>256)return[Buffer.from(o),3];
  n++;
  const nxt=pc+1+il;
  const u16=p[pc+1]!|(p[pc+2]!<<8);
  const off=u16>=32768?u16-65536:u16;
  let b=0,v=0,r=0;
  if(op>=16&&op<=34&&op!==23&&op!==27){
   b=s.pop()!;v=s.pop()!;
   if(op===16)r=(v+b)|0;
   else if(op===17)r=(v-b)|0;
   else if(op===18)r=Math.imul(v,b);
   else if(op===19){if(b===0)return[Buffer.from(o),4];r=v===-2147483648&&b===-1?-2147483648:Math.trunc(v/b)|0}
   else if(op===20){if(b===0)return[Buffer.from(o),4];r=(v%b)|0}
   else if(op===21){if(b===0)return[Buffer.from(o),4];r=Math.trunc((v>>>0)/(b>>>0))|0}
   else if(op===22){if(b===0)return[Buffer.from(o),4];r=((v>>>0)%(b>>>0))|0}
   else if(op===24)r=v&b;
   else if(op===25)r=v|b;
   else if(op===26)r=v^b;
   else if(op===28)r=v<<(b&31);
   else if(op===29)r=v>>(b&31);
   else if(op===30)r=(v>>>(b&31))|0;
   else if(op===32)r=v===b?1:0;
   else if(op===33)r=v<b?1:0;
   else if(op===34)r=(v>>>0)<(b>>>0)?1:0;
   s.push(r);pc=nxt;
  } else if(op===0)return[Buffer.from(o),0];
  else if(op===1){s.push(p[pc+1]!>=128?p[pc+1]!-256:p[pc+1]!);pc=nxt}
  else if(op===2){s.push(p.readInt32LE(pc+1));pc=nxt}
  else if(op===3){s.pop();pc=nxt}
  else if(op===4){s.push(s[s.length-1]!);pc=nxt}
  else if(op===5){const t=s[s.length-1]!;s[s.length-1]=s[s.length-2]!;s[s.length-2]=t;pc=nxt}
  else if(op===6){s.push(s[s.length-2]!);pc=nxt}
  else if(op===7){const t=s[s.length-3]!;s[s.length-3]=s[s.length-2]!;s[s.length-2]=s[s.length-1]!;s[s.length-1]=t;pc=nxt}
  else if(op===23){s.push((-s.pop()!)|0);pc=nxt}
  else if(op===27){s.push(~s.pop()!);pc=nxt}
  else if(op===48){pc=nxt+off}
  else if(op===49){v=s.pop()!;pc=v===0?nxt+off:nxt}
  else if(op===50){v=s.pop()!;pc=v!==0?nxt+off:nxt}
  else if(op===51){if(c.length>=64)return[Buffer.from(o),7];c.push(nxt);pc=u16}
  else if(op===52){if(c.length===0)return[Buffer.from(o),8];pc=c.pop()!}
  else if(op===64){v=s.pop()!;if(v<0||v>255)return[Buffer.from(o),6];s.push(m[v]!);pc=nxt}
  else if(op===65){v=s.pop()!;r=s.pop()!;if(v<0||v>255)return[Buffer.from(o),6];m[v]=r;pc=nxt}
  else if(op===80){v=s.pop()!;const t=String(v);if(o.length+t.length>65536)return[Buffer.from(o),11];for(let i=0;i<t.length;i++)o.push(t.charCodeAt(i));pc=nxt}
  else if(op===81){v=s.pop()!;if(o.length+1>65536)return[Buffer.from(o),11];o.push(v&255);pc=nxt}
  else if(op===82){s.push(ip<inp.length?inp[ip++]!:-1);pc=nxt}
  else if(op===83){v=s.pop()!;return[Buffer.from(o),v&255]}
 }
}
for(const id of readdirSync(I).sort()){
 const prog=readFileSync(join(I,id,'program.bin'));
 const inp=existsSync(join(I,id,'input.bin'))?readFileSync(join(I,id,'input.bin')):Buffer.alloc(0);
 const [o,e]=run(prog,inp);
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),o);
 writeFileSync(join(O,id,'exit.txt'),String(e)+'\n');
}
