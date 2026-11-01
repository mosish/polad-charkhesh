import { bearingScrollState } from '../../lib/bearing-scroll';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type * as THREE from 'three';
import { buildBearingRoom } from '../../lib/bearing-room';
import type { BearingProduct } from '../../domain/product';
import { buildProductBearing3D } from '../../lib/product-bearing-3d';
import { advanceRotation } from '../../lib/bearing-motion';

import {buildBearing, type BearingFamily} from '../../lib/bearing-family-3d';
import {renderBearingTrio, setBearingPresentationLayer} from '../../lib/bearing-trio-composition';
export type {BearingFamily} from '../../lib/bearing-family-3d';

export type SceneProps={family:BearingFamily;paused:boolean;label:string;fallback:React.ReactNode;product?:BearingProduct;rpm?:number;playback?:number;exploded?:boolean;reducedMotion?:boolean;partLabels?:string[];scrollProgress?:number;ambient?:boolean;cinematic?:boolean;companions?:readonly [BearingFamily,BearingFamily]};
type SceneMountOptions = Pick<SceneProps, 'family' | 'product' | 'companions'> & { cinematic: boolean; runtime: typeof THREE; fail: () => void; controller: RefObject<{play:(value:boolean)=>void}|null>; pauseRef: RefObject<boolean>; speedRef: RefObject<{rpm:number;playback:number}>; viewRef: RefObject<{exploded:boolean;reducedMotion:boolean;scrollProgress:number|undefined}> };
function mountBearingScene(target: HTMLElement, {family,product,companions:companionFamilies,cinematic,runtime,fail,controller,pauseRef,speedRef,viewRef}: SceneMountOptions) {
    const THREE=runtime;
    const compactScreen=matchMedia('(max-width: 760px)').matches;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:!compactScreen,powerPreference:'low-power'});}catch{fail();return;}
    // Some Safari drivers report shader failure without throwing from render().
    let shaderFailed=false;
    renderer.debug.onShaderError=()=>{shaderFailed=true;};
    const frameInterval=1000/(compactScreen || !product ? 30 : 60);
    renderer.setPixelRatio(Math.min(devicePixelRatio,compactScreen?1.25:1.75));renderer.setClearColor(0x000000,0);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=cinematic?1.05:1.2;
    target.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,0,9.8);
    const pmrem=new THREE.PMREMGenerator(renderer),room=buildBearingRoom(THREE);
    let environment:THREE.WebGLRenderTarget;
    try {environment=pmrem.fromScene(room.scene,.035);scene.environment=environment.texture;}
    catch {renderer.dispose();renderer.domElement.remove();fail();return;}
    finally {room.dispose();pmrem.dispose();}
    const light=new THREE.DirectionalLight('#e4f1ff',3);light.position.set(-3,4,5);scene.add(light);
    const edge=new THREE.DirectionalLight('#a9c8ff',2);edge.position.set(4,-2,1);scene.add(edge);
    const productModel=product ? buildProductBearing3D(product,THREE) : undefined;
    const heroModel=product ? undefined : buildBearing(family,THREE);
    const model=productModel || heroModel!;scene.add(model.root);
    setBearingPresentationLayer(model.root,'centre');
    light.layers.enable(1);edge.layers.enable(1);
    const companions: ReturnType<typeof buildBearing>[] = [];
    if (cinematic && !product && companionFamilies) {
      companionFamilies.forEach((companionFamily,index) => {
        const side=index===0?-1:1;
        const companion=buildBearing(companionFamily,THREE);
        companion.root.position.set(side*3.25,-.6,-1.7);
        companion.root.scale.setScalar(.86);
        companion.root.rotation.set(.22,-side*.24,side*.12);
        setBearingPresentationLayer(companion.root,'side');
        companions.push(companion);scene.add(companion.root);
      });
      target.dataset.companions=companionFamilies.join(',');
      target.dataset.companionExpansion='0';
    }
    if(cinematic)camera.far=100;
    let frame=0,previous=0,elapsed=0,running=false,inView=true;
    let expansion=viewRef.current.exploded?1:0;
    let shaftAngle=0,cageAngle=0,spinAngle=0;
    const pins=model.parts.map((_,i)=>target.querySelector<HTMLElement>(`[data-part="${i}"]`));
    const projectedPoint=new THREE.Vector3();
    const draw=(now:number)=>{
      if(previous && now-previous < frameInterval-.5){frame=requestAnimationFrame(draw);return;}
      const delta=previous?(now-previous)/1000:1/60;
      const seconds=previous&&running?delta:0;previous=now;
      const scrollView=viewRef.current.scrollProgress === undefined ? undefined : bearingScrollState(viewRef.current.scrollProgress);
      const targetExpansion=scrollView ? scrollView.expansion : viewRef.current.exploded?1:0;
      expansion=viewRef.current.reducedMotion?targetExpansion:THREE.MathUtils.damp(expansion,targetExpansion,7,Math.min(delta,cinematic?.25:.05));
      if(Math.abs(expansion-targetExpansion)<.001)expansion=targetExpansion;
      elapsed+=product ? seconds : Math.min(seconds,.05)*speedRef.current.playback;
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
        model.root.rotation.set((cinematic ? .14 : .56)+(scrollView ? scrollView.progress*.16 : Math.sin(elapsed*.35)*.025), (cinematic?-.14:-.40)+(scrollView ? -scrollView.turn*(family==='thrust'?.3:1) : Math.cos(elapsed*.25)*.035)-expansion*(family==='thrust'?.2:.62),cinematic?-.08:-.22);
        model.root.scale.setScalar((cinematic?1.28:family==='thrust'?1.15:1)*(1-expansion*.23)*(1-(scrollView?.recession || 0)*.3));
        model.root.position.z=-(scrollView?.recession || 0)*2.2;
        target.dataset.recession=String(scrollView?.recession || 0);
        model.root.position.y=(cinematic?-.48*(1-expansion):0)+Math.sin(elapsed*.55)*.02;
        if(family==='track'){
          heroModel!.parts[0].rotation.z=elapsed*.55;
          heroModel!.elements.rotation.z=elapsed*.4;
        }else if(family==='engineered'){
          model.moving.rotation.z=elapsed*.55;heroModel!.elements.rotation.z=elapsed*.22;
        }else if(family==='thrust'||family==='ball'||family==='roller'){
          model.moving.rotation.z=elapsed*.65;model.cage.rotation.z=elapsed*.24;heroModel!.elements.rotation.z=elapsed*.24;
        }
        heroModel!.setExploded(expansion);
        heroModel!.spins.forEach(spin => spin.rotateY(-Math.min(seconds,.05)*speedRef.current.playback*1.2));
        // Independent assemblies: only the central model receives setExploded.
        companions.forEach(companion => {
          companion.moving.rotation.z=elapsed*.28;
          companion.cage.rotation.z=companion.elements.rotation.z=elapsed*.12;
        });
        if(cinematic){camera.position.z=Math.max(8.8,((target.clientWidth<=760?5.5:3.05)+expansion*2.2)/(Math.tan(17*Math.PI/180)*Math.min(camera.aspect,1.5)));camera.updateProjectionMatrix();}
        else if(scrollView){camera.position.z=Math.max(9.8,(2.65+expansion*1.5)/(Math.tan(17*Math.PI/180)*camera.aspect));camera.updateProjectionMatrix();}
      }
      model.root.updateMatrixWorld(true);
      model.parts.forEach((part,i)=>{
        const badge=pins[i];if(!badge)return;
        const point=part.getWorldPosition(projectedPoint).project(camera);
        badge.style.left=`${(point.x*.5+.5)*100}%`;badge.style.top=`${(-point.y*.5+.5)*100}%`;
        badge.style.opacity=String(expansion>.9?1:0);
      });
      target.dataset.expansion=expansion.toFixed(3);
      target.dataset.scrollProgress=viewRef.current.scrollProgress?.toFixed(3) || 'manual';
      try {if(cinematic && companions.length===2){renderBearingTrio(renderer,scene,camera);target.dataset.composition='centre-in-front';}else renderer.render(scene,camera);}catch{running=false;fail();return;}
      if(shaderFailed){running=false;fail();return;}
      target.dataset.motionTime=elapsed.toFixed(3);
      if(running||(inView&&!document.hidden&&expansion!==targetExpansion))frame=requestAnimationFrame(draw);
    };
    const resize=()=>{const {width,height}=target.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.position.z=Math.max(9.8,(viewRef.current.exploded || viewRef.current.scrollProgress !== undefined ?4.15:2.65)/(Math.tan(17*Math.PI/180)*camera.aspect),product?7.5+2.3*product.B/product.D:0);camera.updateProjectionMatrix();renderer.setSize(width,height);if(!running){cancelAnimationFrame(frame);draw(performance.now());}};
    const sync=()=>{running=!pauseRef.current&&!viewRef.current.reducedMotion&&inView&&!document.hidden&&(!product||speedRef.current.rpm>0);cancelAnimationFrame(frame);previous=0;draw(performance.now());};
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(target);resize();sync();
    window.addEventListener('resize',resize);
    const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:.05}):null;intersection?.observe(target);
    document.addEventListener('visibilitychange',sync);
    controller.current={play(){resize();sync();}};
    const lost=(event:Event)=>{event.preventDefault();fail();};renderer.domElement.addEventListener('webglcontextlost',lost);
    return()=>{cancelAnimationFrame(frame);controller.current=null;observer?.disconnect();intersection?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',sync);renderer.domElement.removeEventListener('webglcontextlost',lost);companions.forEach(companion=>companion.dispose());model.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
}

export function BearingSceneRenderer({family,paused,label,fallback,product,rpm=0,playback=1,exploded=false,reducedMotion=false,partLabels=[],scrollProgress,ambient=false,cinematic=false,companions,runtime,rendererKind,onFailure}:SceneProps&{runtime:typeof THREE;rendererKind:'webgl1'|'webgl2';onFailure?:()=>void}) {
  const controller=useRef<{play:(value:boolean)=>void}|null>(null);
  const pauseRef=useRef(paused);
  const speedRef=useRef({rpm,playback});
  const viewRef=useRef({exploded,reducedMotion,scrollProgress});
  useLayoutEffect(()=>{pauseRef.current=paused;speedRef.current={rpm,playback};viewRef.current={exploded,reducedMotion,scrollProgress};},[paused,rpm,playback,exploded,reducedMotion,scrollProgress]);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{if(failed)onFailure?.();},[failed,onFailure]);
  const leftCompanion=companions?.[0],rightCompanion=companions?.[1];
  const mountScene=useCallback((target: HTMLElement | null)=>{
    if(!target || failed)return;
    return mountBearingScene(target, {family,product,companions:leftCompanion && rightCompanion ? [leftCompanion,rightCompanion] : undefined,cinematic,runtime,fail:()=>setFailed(true),controller,pauseRef,speedRef,viewRef});
  },[family,failed,product,cinematic,runtime,leftCompanion,rightCompanion]);
  const manualView=scrollProgress === undefined;
  const ambientProgress=ambient ? scrollProgress : undefined;
  useEffect(()=>controller.current?.play(!paused),[paused,rpm,playback,exploded,reducedMotion,manualView,ambientProgress]);
  return failed ? <div className="hero-model-fallback">{fallback}</div> : <figure ref={mountScene} className="hero-bearing-canvas"  aria-label={label} data-renderer={rendererKind} data-family={family} data-product={product?.code} data-rpm={product?rpm:undefined} data-playback={playback} data-presentation={cinematic?'cinematic':'standard'}>
    {partLabels.map((name,i)=><span key={i} className="bearing-part-pin" data-part={i} aria-hidden="true" title={name}>{i+1}</span>)}
  </figure>;
}
