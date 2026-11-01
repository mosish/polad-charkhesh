import type * as THREE from 'three';

/** Cached boxes avoid allocations in the animation loop. */
export function createTrioBounds(runtime: typeof THREE) {
  return {centre:new runtime.Box3(),left:new runtime.Box3(),right:new runtime.Box3(),all:new runtime.Box3()};
}
type Bounds=ReturnType<typeof createTrioBounds>;
export const bearingTrioGap=.32;

/** Separate complete world-space geometry, including studs and exploded parts.
 * No family-specific radius assumptions: future models use the same clearance.
 */
export function layoutBearingTrio(centre:THREE.Group, sides:readonly [THREE.Group,THREE.Group], camera:THREE.PerspectiveCamera, boxes:Bounds) {
  boxes.centre.setFromObject(centre);
  sides.forEach((side,index)=>{
    const box=index===0?boxes.left:boxes.right;
    box.setFromObject(side);
    const dx=index===0?boxes.centre.min.x-bearingTrioGap-box.max.x:boxes.centre.max.x+bearingTrioGap-box.min.x;
    side.position.x+=dx;
    box.min.x+=dx;box.max.x+=dx;
    side.updateMatrixWorld(true);
  });
  const tangent=Math.tan(camera.fov*Math.PI/360);
  const fit=()=>{
    boxes.all.copy(boxes.centre).union(boxes.left).union(boxes.right);
    let distance=8.8;
    for(const x of [boxes.all.min.x,boxes.all.max.x])for(const y of [boxes.all.min.y,boxes.all.max.y])for(const z of [boxes.all.min.z,boxes.all.max.z]){
      distance=Math.max(distance,z+1.08*Math.max(Math.abs(x)/(tangent*camera.aspect),Math.abs(y)/tangent));
    }
    camera.position.z=distance;
  };
  fit();
  // World-space clearance alone does not prevent perspective silhouettes from
  // overlapping. Keep a visible gap on screen as well, including protruding studs.
  for(let iteration=0;iteration<16;iteration++){
    const depth=camera.position.z, horizontal=tangent*camera.aspect;
    let cmin=Infinity,cmax=-Infinity;
    for(const x of [boxes.centre.min.x,boxes.centre.max.x])for(const z of [boxes.centre.min.z,boxes.centre.max.z]){
      const projected=x/((depth-z)*horizontal);cmin=Math.min(cmin,projected);cmax=Math.max(cmax,projected);
    }
    let moved=false;
    sides.forEach((side,index)=>{
      const box=index===0?boxes.left:boxes.right;
      let dx=0;
      for(const x of [box.min.x,box.max.x])for(const z of [box.min.z,box.max.z]){
        const needed=(index===0?cmin-.04:cmax+.04)*(depth-z)*horizontal-x;
        dx=index===0?Math.min(dx,needed):Math.max(dx,needed);
      }
      if(Math.abs(dx)>.000001){moved=true;side.position.x+=dx;box.min.x+=dx;box.max.x+=dx;side.updateMatrixWorld(true);}
    });
    if(!moved)break;
    fit();
  }
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
