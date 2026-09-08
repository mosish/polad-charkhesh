import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { BearingProduct } from '../../domain/product';
import { buildProductBearing3D } from '../../lib/product-bearing-3d';
import { advanceRotation } from '../../lib/bearing-motion';

export type BearingFamily = 'precision' | 'rolling' | 'plain';

// Illustrative family geometry, not manufacturer CAD or a rated operating simulation.
function buildBearing(family: BearingFamily) {
  const root = new THREE.Group(), moving = new THREE.Group(), cage = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const steel = new THREE.MeshStandardMaterial({color: '#bcc5d0', metalness: 1, roughness: .22});
  const polished = new THREE.MeshStandardMaterial({color: '#e2e6ed', metalness: 1, roughness: .13});
  const bronze = new THREE.MeshStandardMaterial({color: '#b78b45', metalness: .85, roughness: .3});
  const polymer = new THREE.MeshStandardMaterial({color: '#806044', metalness: .12, roughness: .43});
  const dark = new THREE.MeshStandardMaterial({color: '#303c48', metalness: .65, roughness: .34});
  const materials: THREE.Material[] = [steel, polished, bronze, polymer, dark];
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, group = root) => {
    const m = new THREE.Mesh(geometry, material); group.add(m); return m;
  };
  const lathe = (points: number[][], material = steel, group = root) => {
    const geometry = new THREE.LatheGeometry(points.map(([r,z]) => new THREE.Vector2(r,z)), 128);
    geometry.rotateX(Math.PI / 2);
    return mesh(geometry, material, group);
  };
  const torus = (radius: number, tube: number, z: number, material = polished, group = root) => {
    const m = mesh(new THREE.TorusGeometry(radius,tube,8,128),material,group); m.position.z=z; return m;
  };
  root.add(moving,cage);
  if (family === 'plain') {
    // The concave outer liner mates to the convex inner ring; there are no rolling elements.
    lathe([[2.26,-.38],[2.3,-.34],[2.3,.34],[2.26,.38],[1.87,.38],[1.96,.2],[2,0],[1.96,-.2],[1.87,-.38],[2.26,-.38]]);
    lathe([[1.86,-.39],[1.95,-.2],[1.99,0],[1.95,.2],[1.86,.39],[1.82,.39],[1.91,.2],[1.95,0],[1.91,-.2],[1.82,-.39],[1.86,-.39]],dark);
    const curve = Array.from({length:25},(_,i)=>{const z=-.72+i*.06;return [Math.sqrt(1.945**2-z*z),z];});
    lathe([...curve,[1.1,.72],[1.06,.68],[1.06,-.68],[1.1,-.72],curve[0]],polished,moving);
    torus(1.1,.016,.718,steel,moving);
    torus(2.275,.012,.375);
  } else {
    const precision = family === 'precision';
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
      const element=mesh(elementGeometry,polished,cage);element.position.set(x,y,0);
      const bridge=mesh(new THREE.BoxGeometry(.53,.065,precision ? .15 : .8),cageMaterial,cage);
      const between=a+Math.PI/count;bridge.position.set(Math.cos(between)*pitch,Math.sin(between)*pitch,precision ? -.12 : 0);bridge.rotation.z=between;
      if(!precision) {
        const cap=mesh(new THREE.CircleGeometry(radius-.035,40),steel,cage);cap.position.set(x,y,.367);
        const dimple=mesh(new THREE.CircleGeometry(.037,20),dark,cage);dimple.position.set(x,y,.368);
      }
    }
  }
  // Fine concentric machining lines and restrained laser-style face markings.
  const front=family==='rolling' ? .48 : family==='plain' ? .38 : .35;
  for(let i=0;i<6;i++)torus(2.035+i*.035,.0015,front+.001,steel);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d')!;ctx.translate(512,512);ctx.fillStyle='#27313d';ctx.font='500 20px Arial';ctx.textAlign='center';
  const label=family==='precision' ? 'POLAD CHARKHESH  •  SUPER PRECISION' : family==='rolling' ? 'POLAD CHARKHESH  •  ROLLER SERIES' : 'POLAD CHARKHESH  •  SPHERICAL PLAIN';
  Array.from(label).forEach((c,i)=>{ctx.save();ctx.rotate((i-(label.length-1)/2)*.028);ctx.fillText(c,0,-469);ctx.restore();});
  const engraving=new THREE.CanvasTexture(canvas);engraving.colorSpace=THREE.SRGBColorSpace;textures.push(engraving);
  const ink=new THREE.MeshBasicMaterial({map:engraving,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});materials.push(ink);
  mesh(new THREE.PlaneGeometry(4.6,4.6),ink).position.z=front+.002;
  return {root, moving, cage, dispose(){
    const geometries=new Set<THREE.BufferGeometry>();root.traverse(o=>{if(o instanceof THREE.Mesh)geometries.add(o.geometry);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
  }};
}

export default function HeroBearingScene({family,paused,label,fallback,product,rpm=0,playback=1}:{family:BearingFamily;paused:boolean;label:string;fallback:React.ReactNode;product?:BearingProduct;rpm?:number;playback?:number}) {
  const host=useRef<HTMLDivElement>(null);
  const controller=useRef<{play:(value:boolean)=>void}|null>(null);
  const pauseRef=useRef(paused);pauseRef.current=paused;
  const speedRef=useRef({rpm,playback});speedRef.current={rpm,playback};
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
    const model=productModel || buildBearing(family);scene.add(model.root);
    let frame=0,previous=0,elapsed=0,running=false,inView=true;
    let shaftAngle=0,cageAngle=0,spinAngle=0;
    const draw=(now:number)=>{
      const seconds=previous&&running?(now-previous)/1000:0;previous=now;
      elapsed+=product ? seconds : Math.min(seconds,.05);
      if(productModel){
        const {rpm:currentRpm,playback:rate}=speedRef.current;
        shaftAngle=advanceRotation(shaftAngle,currentRpm,seconds,rate);
        cageAngle=advanceRotation(cageAngle,currentRpm*productModel.geometry.cageRatio,seconds,rate);
        spinAngle=advanceRotation(spinAngle,currentRpm*productModel.geometry.spinRatio,seconds,rate);
        model.root.rotation.set(.56,-.40,-.22);
        model.moving.rotation.z=shaftAngle*Math.PI/180;model.cage.rotation.z=cageAngle*Math.PI/180;
        productModel.spins.forEach(spin=>{if(productModel.geometry.roller)spin.rotation.z=-spinAngle*Math.PI/180;else spin.rotation.y=-spinAngle*Math.PI/180;});
        target.dataset.shaftAngle=shaftAngle.toFixed(3);target.dataset.cageAngle=cageAngle.toFixed(3);
      } else {
        model.root.rotation.set(.56+Math.sin(elapsed*.35)*.055,-.40+Math.cos(elapsed*.25)*.07,-.22);
        model.root.position.y=Math.sin(elapsed*.55)*.045;
        if(family==='plain'){model.moving.rotation.x=Math.sin(elapsed*.7)*.22;model.moving.rotation.y=Math.sin(elapsed*.45)*.12;}
        else {model.moving.rotation.z=elapsed*.65;model.cage.rotation.z=elapsed*.24;}
      }
      renderer.render(scene,camera);
      target.dataset.motionTime=elapsed.toFixed(3);
      if(running)frame=requestAnimationFrame(draw);
    };
    const resize=()=>{const {width,height}=target.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.position.z=Math.max(9.8,2.65/(Math.tan(17*Math.PI/180)*camera.aspect),product?7.5+2.3*product.B/product.D:0);camera.updateProjectionMatrix();renderer.setSize(width,height);if(!running)draw(performance.now());};
    const sync=()=>{running=!pauseRef.current&&inView&&!document.hidden&&(!product||speedRef.current.rpm>0);cancelAnimationFrame(frame);previous=0;draw(performance.now());};
    const observer=new ResizeObserver(resize);observer.observe(target);resize();sync();
    const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:.05});intersection.observe(target);
    document.addEventListener('visibilitychange',sync);
    controller.current={play(){sync();}};
    const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
    return()=>{cancelAnimationFrame(frame);controller.current=null;observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',sync);renderer.domElement.removeEventListener('webglcontextlost',lost);model.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
  },[family,failed,product]);
  useEffect(()=>controller.current?.play(!paused),[paused,rpm,playback]);
  return failed ? <div className="hero-model-fallback">{fallback}</div> : <div ref={host} className="hero-bearing-canvas" role="img" aria-label={label} data-family={family} data-product={product?.code} data-rpm={product?rpm:undefined} data-playback={product?playback:undefined}/>;
}
