import type * as THREE from 'three';

/** Same studio on both renderers. Adapted from Three.js RoomEnvironment (MIT). */
export function buildBearingRoom(runtime: typeof THREE) {
  const T=runtime, scene=new T.Scene();scene.position.y=-3.5;
  const geometry=new T.BoxGeometry();geometry.deleteAttribute('uv');
  const materials:THREE.Material[]=[];
  const roomMaterial=new T.MeshStandardMaterial({side:T.BackSide});
  const boxMaterial=new T.MeshStandardMaterial();materials.push(roomMaterial,boxMaterial);
  const light=new T.PointLight(0xffffff,900,28,2);light.position.set(.418,16.199,.300);scene.add(light);
  const room=new T.Mesh(geometry,roomMaterial);room.position.set(-.757,13.219,.717);room.scale.set(31.713,28.305,28.591);scene.add(room);
  const boxes=new T.InstancedMesh(geometry,boxMaterial,6), transform=new T.Object3D();
  const objects=[
    [-10.906,2.009,1.846,-.195,2.328,7.905,4.651],
    [-5.607,-.754,-.758,.994,1.970,1.534,3.955],
    [6.167,.857,7.803,.561,3.927,6.285,3.687],
    [-2.017,.018,6.124,.333,2.002,4.566,2.064],
    [2.291,-.756,-2.621,-.286,1.546,1.552,1.496],
    [-2.193,-.369,-5.547,.516,3.875,3.487,2.986],
  ];
  objects.forEach(([x,y,z,angle,sx,sy,sz],index)=>{transform.position.set(x,y,z);transform.rotation.set(0,angle,0);transform.scale.set(sx,sy,sz);transform.updateMatrix();boxes.setMatrixAt(index,transform.matrix);});scene.add(boxes);
  for(const [x,y,z,sx,sy,sz,intensity] of [
    [-16.116,14.37,8.208,.1,2.428,2.739,50],[-16.109,18.021,-8.207,.1,2.425,2.751,50],
    [14.904,12.198,-1.832,.15,4.265,6.331,17],[-.462,8.89,14.520,4.38,5.441,.088,43],
    [3.235,11.486,-12.541,2.5,2,.1,20],[0,20,0,1,.1,1,100],
  ]){const material=new T.MeshLambertMaterial({color:0,emissive:0xffffff,emissiveIntensity:intensity});materials.push(material);const panel=new T.Mesh(geometry,material);panel.position.set(x,y,z);panel.scale.set(sx,sy,sz);scene.add(panel);}
  return {scene,dispose(){geometry.dispose();materials.forEach(material=>material.dispose());boxes.dispose();}};
}
