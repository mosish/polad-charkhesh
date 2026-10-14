import {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry,
  DataTexture, DirectionalLight, Group, LatheGeometry, LinearFilter, LinearMipmapLinearFilter,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, RepeatWrapping, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer, BackSide, InstancedMesh, MeshLambertMaterial, PointLight, Object3D,
} from 'three-webgl1/src/Three.js';
import type * as Three from 'three';
import {BearingSceneRenderer, type SceneProps} from './BearingSceneRenderer';

// Only the common constructors/constants used by our scene are provided.
// r162 supports WebGL 1; it receives the same model builders and motion code.
const runtime = {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, CircleGeometry, CylinderGeometry,
  DataTexture, DirectionalLight, Group, LatheGeometry, LinearFilter, LinearMipmapLinearFilter,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, RepeatWrapping, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer, BackSide, InstancedMesh, MeshLambertMaterial, PointLight, Object3D,
} as unknown as typeof Three;

export default function LegacyBearingScene(props: SceneProps) {
  return <BearingSceneRenderer {...props} runtime={runtime} rendererKind="webgl1"/>;
}
