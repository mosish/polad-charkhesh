import type * as THREE from 'three';

export function setBearingPresentationLayer(root:THREE.Object3D, role:'centre'|'side') {
  root.traverse(object=>object.layers.set(role==='centre'?0:1));
}

/** Independent illustrations share a canvas, not a depth buffer. Render the
 * compact background pair first, then the complete central assembly in front.
 * Each assembly retains its own normal internal depth testing.
 */
export function renderBearingTrio(renderer:Pick<THREE.WebGLRenderer,'autoClear'|'render'|'clearDepth'>,scene:THREE.Scene,camera:THREE.Camera) {
  const autoClear=renderer.autoClear,mask=camera.layers.mask;
  try {
    renderer.autoClear=true;camera.layers.set(1);renderer.render(scene,camera);
    renderer.clearDepth();
    renderer.autoClear=false;camera.layers.set(0);renderer.render(scene,camera);
  } finally {
    renderer.autoClear=autoClear;camera.layers.mask=mask;
  }
}
