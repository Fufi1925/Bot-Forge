import { useEffect, useRef } from 'react';

export default function ParticleBackground(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext('2d');if(!ctx)return;
    let id=0,mx=0,my=0;
    const cols=['rgba(0,240,255,','rgba(168,85,247,','rgba(236,72,153,','rgba(59,130,246,'];
    let particles:{x:number;y:number;vx:number;vy:number;s:number;o:number;c:string;p:number;ps:number}[]=[];
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;const n=Math.min(Math.floor(c.width*c.height/15000),120);particles=Array.from({length:n},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,s:Math.random()*2+.5,o:Math.random()*.4+.1,c:cols[Math.floor(Math.random()*cols.length)],p:0,ps:Math.random()*.02+.005}));};
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      const t=Date.now()*.0003;
      // Gradient orbs
      [{px:.3,py:.3,c1:'rgba(168,85,247,',c2:'rgba(168,85,247,0)'},{px:.7,py:.6,c1:'rgba(0,240,255,',c2:'rgba(0,240,255,0)'},{px:.5,py:.8,c1:'rgba(236,72,153,',c2:'rgba(236,72,153,0)'}].forEach(({px,py,c1,c2})=>{
        const gx=c.width*px+Math.sin(t*1.2)*100,gy=c.height*py+Math.cos(t)*80;
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,300);
        g.addColorStop(0,c1+'0.04)');g.addColorStop(1,c2+')');
        ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
      });
      for(const p of particles){
        p.x+=p.vx;p.y+=p.vy;p.p+=p.ps;
        if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
        p.vx*=.999;p.vy*=.999;
        ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fillStyle=p.c+(p.o+Math.sin(p.p)*.12)+')';ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,p.s*3,0,Math.PI*2);ctx.fillStyle=p.c+(p.o*.08)+')';ctx.fill();
        // Mouse attraction
        const dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);
        if(d<200){p.vx+=dx*.000015;p.vy+=dy*.000015;const o=(1-d/200)*.12;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.strokeStyle=`rgba(0,240,255,${o})`;ctx.lineWidth=.6;ctx.stroke();}
      }
      // Connections
      for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(168,85,247,${(1-d/100)*.06})`;ctx.lineWidth=.4;ctx.stroke();}
      }
      id=requestAnimationFrame(draw);
    };
    const mv=(e:MouseEvent)=>{mx=e.clientX;my=e.clientY;};
    resize();draw();
    window.addEventListener('resize',resize);window.addEventListener('mousemove',mv);
    return()=>{cancelAnimationFrame(id);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',mv);};
  },[]);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none"/>;
}
