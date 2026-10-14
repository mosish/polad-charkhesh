import {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry,
  DataTexture, DirectionalLight, Group, LatheGeometry, LinearFilter, LinearMipmapLinearFilter,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, RepeatWrapping, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer, BackSide, InstancedMesh, MeshLambertMaterial, PointLight, Object3D,
} from 'three';
import type * as Three from 'three';
import {BearingSceneRenderer, type SceneProps} from './BearingSceneRenderer';

// Named exports keep unused Three.js features outside the selected renderer.
const runtime={
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry,
  DataTexture, DirectionalLight, Group, LatheGeometry, LinearFilter, LinearMipmapLinearFilter,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, RepeatWrapping, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer, BackSide, InstancedMesh, MeshLambertMaterial, PointLight, Object3D,
} as unknown as typeof Three;

export default function ModernBearingScene(props:SceneProps&{onFailure:()=>void}){
  return <BearingSceneRenderer {...props} runtime={runtime} rendererKind="webgl2"/>;
}
