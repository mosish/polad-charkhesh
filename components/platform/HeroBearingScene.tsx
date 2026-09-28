import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { BearingProduct } from '../../domain/product';
import { buildProductBearing3D } from '../../lib/product-bearing-3d';
import { advanceRotation } from '../../lib/bearing-motion';

export type BearingFamily = 'ball' | 'roller' | 'accessories' | 'engineered' | 'track';

// Illustrative family geometry, not manufacturer CAD or a rated operating simulation.
function buildBearing(family: BearingFamily) {
  const root = new THREE.Group(), shell = new THREE.Group(), moving = new THREE.Group(), cage = new THREE.Group(), elements = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const steel = new THREE.MeshStandardMaterial({color: '#bcc5d0', metalness: 1, roughness: .22});
  const polished = new THREE.MeshStandardMaterial({color: '#e2e6ed', metalness: 1, roughness: .13});
  const bronze = new THREE.MeshStandardMaterial({color: '#b78b45', metalness: .85, roughness: .3});
  const polymer = new THREE.MeshStandardMaterial({color: '#806044', metalness: .12, roughness: .43});
  const dark = new THREE.MeshStandardMaterial({color: '#303c48', metalness: .65, roughness: .34});
  const materials: THREE.Material[] = [steel, polished, bronze, polymer, dark];
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, group = shell) => {
    const m = new THREE.Mesh(geometry, material); group.add(m); return m;
  };
  const lathe = (points: number[][], material = steel, group = shell) => {
    const geometry = new THREE.LatheGeometry(points.map(([r,z]) => new THREE.Vector2(r,z)), 128);
    geometry.rotateX(Math.PI / 2);
    return mesh(geometry, material, group);
  };
  const torus = (radius: number, tube: number, z: number, material = polished, group = shell) => {
    const m = mesh(new THREE.TorusGeometry(radius,tube,8,128),material,group); m.position.z=z; return m;
  };
  const cylinder=(radius:number,depth:number,z:number,material:THREE.Material,group:THREE.Group)=>{
    const m=mesh(new THREE.CylinderGeometry(radius,radius,depth,64),material,group);
    m.rotation.x=Math.PI/2;m.position.z=z;return m;
  };
  root.add(shell,moving,cage,elements);
  if (family === 'accessories') {
    // A tapered adapter sleeve, locknut and tab washer around a shaft seat.
    lathe([[1.02,-.85],[1.11,-.85],[1.37,.7],[1.37,.85],[1.06,.85],[1.02,-.85]],steel,shell);
    torus(1.35,.025,.82,polished,shell);
    lathe([[1.4,.45],[1.88,.45],[1.94,.5],[1.94,.95],[1.88,1],[1.4,1],[1.4,.45]],dark,elements);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const notch=mesh(new THREE.BoxGeometry(.16,.22,.58),steel,elements);
      notch.position.set(Math.cos(a)*1.91,Math.sin(a)*1.91,.73);notch.rotation.z=a;
    }
    lathe([[1.37,.19],[1.85,.19],[1.85,.29],[1.37,.29],[1.37,.19]],bronze,cage);
    const tab=mesh(new THREE.BoxGeometry(.18,.28,.12),bronze,cage);tab.position.set(0,1.84,.24);
    cylinder(.97,1.7,0,dark,moving);torus(.97,.025,.87,polished,moving);
  } else if (family === 'engineered') {
    // Mounted bearing unit: cast housing, insert, retaining hardware and shaft.
    const base=mesh(new THREE.BoxGeometry(5.05,.48,1.55),dark,shell);base.position.y=-1.99;
    lathe([[1.61,-.69],[2.28,-.69],[2.3,-.62],[2.3,.62],[2.28,.69],[1.61,.69],[1.61,-.69]],steel,shell);
    for(const x of [-1.87,1.87]){
      const foot=mesh(new THREE.BoxGeometry(.85,.45,1.5),steel,shell);foot.position.set(x,-1.6,0);
      cylinder(.19,.18,.87,dark,cage).position.set(x,-1.96,.87);
      cylinder(.29,.11,.99,polished,cage).position.set(x,-1.96,.99);
    }
    lathe([[1.34,-.62],[1.55,-.62],[1.6,-.53],[1.6,.53],[1.55,.62],[1.34,.62],[1.34,-.62]],polished,elements);
    for(let i=0;i<14;i++){
      const a=i*Math.PI/7;
      const ball=mesh(new THREE.SphereGeometry(.19,20,16),polished,elements);
      ball.position.set(Math.cos(a)*1.28,Math.sin(a)*1.28,0);
    }
    lathe([[.84,-.72],[1.1,-.72],[1.1,.72],[.84,.72],[.84,-.72]],bronze,moving);
    cylinder(.8,2.05,0,dark,moving);
  } else if (family === 'track') {
    // Stud cam follower: broad outer tread rotates about a fixed integral stud.
    lathe([[1.78,-.73],[2.22,-.73],[2.29,-.66],[2.29,.66],[2.22,.73],[1.78,.73],[1.78,-.73]],steel,shell);
    for(const z of [-.52,.52])torus(2.25,.018,z,polished,shell);
    for(let i=0;i<21;i++){
      const a=i*Math.PI*2/21;
      const needle=cylinder(.17,1.12,0,polished,elements);
      needle.position.set(Math.cos(a)*1.59,Math.sin(a)*1.59,0);
    }
    lathe([[1.06,-.83],[1.85,-.83],[1.85,-.69],[1.06,-.69],[1.06,-.83]],bronze,cage);
    cylinder(1.41,1.55,0,dark,moving);
    cylinder(.69,1.24,1.4,steel,moving);
    cylinder(.86,.2,2.02,polished,moving);
    mesh(new THREE.CircleGeometry(.29,6),dark,moving).position.z=2.122;
    torus(.98,.035,.79,polished,moving);
  } else if (family === 'roller') {
    // Two inclined rows of barrel rollers share a concave spherical outer raceway.
    const half=.8;
    const race=Array.from({length:25},(_,i)=>{const z=half-i*2*half/24;return [Math.sqrt(2.08**2-z*z),z];});
    lathe([[2.26,-half],[2.3,-half+.04],[2.3,half-.04],[2.26,half],...race,[2.26,-half]]);
    lathe([[1.45,-half],[1.48,-.74],[1.38,-.43],[1.48,-.09],[1.5,0],[1.48,.09],[1.38,.43],[1.48,.74],[1.45,half],[1.08,half],[1.045,.76],[1.045,-.76],[1.08,-half],[1.45,-half]],steel,moving);
    torus(2.26,.013,half-.004);
    torus(1.08,.013,half-.004,polished,moving);
    const profile=[new THREE.Vector2(0,-.32),...Array.from({length:17},(_,i)=>{const z=-.32+i*.04;return new THREE.Vector2(.28-.08*(z/.32)**2,z);}),new THREE.Vector2(0,.32)];
    const rollerGeometry=new THREE.LatheGeometry(profile,40);
    for(const row of [-1,1]) {
      for(const z of [row*.09,row*.73])torus(1.69,.045,z,bronze,cage);
      for(let i=0;i<16;i++) {
        const a=i*Math.PI*2/16, pitch=1.69;
        const roller=mesh(rollerGeometry,polished,elements);
        roller.position.set(Math.cos(a)*pitch,Math.sin(a)*pitch,row*.41);
        roller.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-row*.2*Math.cos(a),-row*.2*Math.sin(a),1).normalize());
        const between=a+Math.PI/16;
        const bridge=mesh(new THREE.BoxGeometry(.1,.065,.66),bronze,cage);
        bridge.position.set(Math.cos(between)*pitch,Math.sin(between)*pitch,row*.41);
        bridge.rotation.z=between;
      }
    }
  } else {
    const precision = family === 'ball';
    const half = precision ? .35 : .48;
    // Chamfered shoulders and recessed raceways expose the rolling elements.
    lathe([[2.265,-half],[2.3,-half+.035],[2.3,half-.035],[2.265,half],[precision ? 2.07 : 1.98,half],[precision ? 2.035 : 1.945,half-.04],[precision ? 2.035 : 1.945,.18],[2.015,.08],[2.04,0],[2.015,-.1],[1.95,-.2],[1.95,-half+.04],[1.99,-half],[2.265,-half]]);
    lathe([[1.42,-half],[1.46,-half+.04],[1.46,-.18],[1.39,-.07],[1.38,0],[1.40,.1],[1.46,.2],[1.46,half-.04],[1.42,half],[1.08,half],[1.045,half-.035],[1.045,-half+.035],[1.08,-half],[1.42,-half]],steel,moving);
    torus(2.265,.013,half-.004);
    torus(1.085,.013,half-.004,polished,moving);
    const count = precision ? 17 : 14, pitch = 1.71, radius = precision ? .303 : .272;
    const elementGeometry = precision ? new THREE.SphereGeometry(radius,32,24) : new THREE.LatheGeometry([
      new THREE.Vector2(0,-.365),new THREE.Vector2(radius-.025,-.365),new THREE.Vector2(radius,-.34),new THREE.Vector2(radius,.34),new THREE.Vector2(radius-.025,.365),new THREE.Vector2(0,.365)
    ],48);
    if (!precision) elementGeometry.rotateX(Math.PI/2);
    const cageMaterial = precision ? polymer : bronze;
    torus(1.46,.045,precision ? -.09 : .395,cageMaterial,cage);
    torus(1.955,.045,precision ? -.09 : .395,cageMaterial,cage);
    torus(1.71,.065,-.33,cageMaterial,cage);
    for(let i=0;i<count;i++) {
      const a=i*Math.PI*2/count, x=Math.cos(a)*pitch,y=Math.sin(a)*pitch;
      const element=mesh(elementGeometry,polished,elements);element.position.set(x,y,0);
      const bridge=mesh(new THREE.BoxGeometry(.53,.065,precision ? .15 : .8),cageMaterial,cage);
      const between=a+Math.PI/count;bridge.position.set(Math.cos(between)*pitch,Math.sin(between)*pitch,precision ? -.12 : 0);bridge.rotation.z=between;
      if(!precision) {
        const cap=mesh(new THREE.CircleGeometry(radius-.035,40),steel,elements);cap.position.set(x,y,.367);
        const dimple=mesh(new THREE.CircleGeometry(.037,20),dark,elements);dimple.position.set(x,y,.368);
      }
    }
  }
  // Fine concentric machining lines and restrained laser-style face markings.
  if(family==='ball'||family==='roller'){
    const front=family==='roller' ? .8 : .35;
    for(let i=0;i<6;i++)torus(2.035+i*.035,.0015,front+.001,steel);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const ctx=canvas.getContext('2d')!;ctx.translate(512,512);ctx.fillStyle='#27313d';ctx.font='500 20px Arial';ctx.textAlign='center';
    const label=family==='ball' ? 'POLAD CHARKHESH  •  BALL BEARINGS' : 'POLAD CHARKHESH  •  ROLLER BEARINGS';
    Array.from(label).forEach((c,i)=>{ctx.save();ctx.rotate((i-(label.length-1)/2)*.028);ctx.fillText(c,0,-469);ctx.restore();});
    const engraving=new THREE.CanvasTexture(canvas);engraving.colorSpace=THREE.SRGBColorSpace;textures.push(engraving);
    const ink=new THREE.MeshBasicMaterial({map:engraving,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});materials.push(ink);
    mesh(new THREE.PlaneGeometry(4.6,4.6),ink).position.z=front+.002;
  }
  return {root, moving, cage, elements, parts:[shell,elements,cage,moving], setExploded(amount:number){
    [shell,elements,cage,moving].forEach((part,i)=>{part.position.z=(i-1.5)*2.7*amount;});
  }, dispose(){
    const geometries=new Set<THREE.BufferGeometry>();root.traverse(o=>{if(o instanceof THREE.Mesh)geometries.add(o.geometry);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
  }};
}

export default function HeroBearingScene({family,paused,label,fallback,product,rpm=0,playback=1,exploded=false,reducedMotion=false,partLabels=[]}:{family:BearingFamily;paused:boolean;label:string;fallback:React.ReactNode;product?:BearingProduct;rpm?:number;playback?:number;exploded?:boolean;reducedMotion?:boolean;partLabels?:string[]}) {
  const host=useRef<HTMLDivElement>(null);
  const controller=useRef<{play:(value:boolean)=>void}|null>(null);
  const pauseRef=useRef(paused);pauseRef.current=paused;
  const speedRef=useRef({rpm,playback});speedRef.current={rpm,playback};
  const viewRef=useRef({exploded,reducedMotion});viewRef.current={exploded,reducedMotion};
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const target=host.current;if(!target || failed)return;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    target.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,0,9.8);
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    const environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;
    room.dispose();pmrem.dispose();
    const light=new THREE.DirectionalLight('#e4f1ff',3);light.position.set(-3,4,5);scene.add(light);
    const edge=new THREE.DirectionalLight('#a9c8ff',2);edge.position.set(4,-2,1);scene.add(edge);
    const productModel=product ? buildProductBearing3D(product) : undefined;
    const heroModel=product ? undefined : buildBearing(family);
    const model=productModel || heroModel!;scene.add(model.root);
    let frame=0,previous=0,elapsed=0,running=false,inView=true;
    let expansion=viewRef.current.exploded?1:0;
    let shaftAngle=0,cageAngle=0,spinAngle=0;
    const draw=(now:number)=>{
      const delta=previous?(now-previous)/1000:1/60;
      const seconds=previous&&running?delta:0;previous=now;
      const targetExpansion=viewRef.current.exploded?1:0;
      expansion=viewRef.current.reducedMotion?targetExpansion:THREE.MathUtils.damp(expansion,targetExpansion,7,Math.min(delta,.05));
      if(Math.abs(expansion-targetExpansion)<.001)expansion=targetExpansion;
      elapsed+=product ? seconds : Math.min(seconds,.05);
      if(productModel){
        const {rpm:currentRpm,playback:rate}=speedRef.current;
        shaftAngle=advanceRotation(shaftAngle,currentRpm,seconds,rate);
        cageAngle=advanceRotation(cageAngle,currentRpm*productModel.geometry.cageRatio,seconds,rate);
        spinAngle=advanceRotation(spinAngle,currentRpm*productModel.geometry.spinRatio,seconds,rate);
        model.root.rotation.set(.56,-.40,-.22);
        model.root.scale.setScalar(1-expansion*.2);
        model.moving.rotation.z=shaftAngle*Math.PI/180;model.cage.rotation.z=cageAngle*Math.PI/180;
        productModel.elements.rotation.z=cageAngle*Math.PI/180;
        productModel.setExploded(expansion);
        productModel.spins.forEach(spin=>{if(productModel.geometry.roller)spin.rotation.z=-spinAngle*Math.PI/180;else spin.rotation.y=-spinAngle*Math.PI/180;});
        target.dataset.shaftAngle=shaftAngle.toFixed(3);target.dataset.cageAngle=cageAngle.toFixed(3);
      } else {
        model.root.rotation.set(.56+Math.sin(elapsed*.35)*.055,-.40+Math.cos(elapsed*.25)*.07-expansion*.62,-.22);
        model.root.scale.setScalar(1-expansion*.23);
        model.root.position.y=Math.sin(elapsed*.55)*.045;
        if(family==='track'){
          heroModel!.parts[0].rotation.z=elapsed*.55;
          heroModel!.elements.rotation.z=elapsed*.4;
        }else if(family==='engineered'){
          model.moving.rotation.z=elapsed*.55;heroModel!.elements.rotation.z=elapsed*.22;
        }else if(family==='ball'||family==='roller'){
          model.moving.rotation.z=elapsed*.65;model.cage.rotation.z=elapsed*.24;heroModel!.elements.rotation.z=elapsed*.24;
        }
        heroModel!.setExploded(expansion);
      }
      model.root.updateMatrixWorld(true);
      model.parts.forEach((part,i)=>{
        const badge=target.querySelector<HTMLElement>(`[data-part="${i}"]`);if(!badge)return;
        const point=part.getWorldPosition(new THREE.Vector3()).project(camera);
        badge.style.left=`${(point.x*.5+.5)*100}%`;badge.style.top=`${(-point.y*.5+.5)*100}%`;
        badge.style.opacity=String(expansion>.9?1:0);
      });
      target.dataset.expansion=expansion.toFixed(3);
      renderer.render(scene,camera);
      target.dataset.motionTime=elapsed.toFixed(3);
      if(running||(inView&&!document.hidden&&expansion!==targetExpansion))frame=requestAnimationFrame(draw);
    };
    const resize=()=>{const {width,height}=target.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.position.z=Math.max(9.8,(viewRef.current.exploded?4.15:2.65)/(Math.tan(17*Math.PI/180)*camera.aspect),product?7.5+2.3*product.B/product.D:0);camera.updateProjectionMatrix();renderer.setSize(width,height);if(!running){cancelAnimationFrame(frame);draw(performance.now());}};
    const sync=()=>{running=!pauseRef.current&&inView&&!document.hidden&&(!product||speedRef.current.rpm>0);cancelAnimationFrame(frame);previous=0;draw(performance.now());};
    const observer=new ResizeObserver(resize);observer.observe(target);resize();sync();
    const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:.05});intersection.observe(target);
    document.addEventListener('visibilitychange',sync);
    controller.current={play(){resize();sync();}};
    const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
    return()=>{cancelAnimationFrame(frame);controller.current=null;observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',sync);renderer.domElement.removeEventListener('webglcontextlost',lost);model.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
  },[family,failed,product]);
  useEffect(()=>controller.current?.play(!paused),[paused,rpm,playback,exploded,reducedMotion]);
  return failed ? <div className="hero-model-fallback">{fallback}</div> : <div ref={host} className="hero-bearing-canvas" role="img" aria-label={label} data-family={family} data-product={product?.code} data-rpm={product?rpm:undefined} data-playback={product?playback:undefined}>
    {partLabels.map((name,i)=><span key={i} className="bearing-part-pin" data-part={i} aria-hidden="true" title={name}>{i+1}</span>)}
  </div>;
}
