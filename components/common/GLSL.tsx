import React from "react";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
  TextureLoader,
  Clock,
} from "three";

type AnimateParams = {
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
  _uniforms: any;
  clock: Clock;
};

const GLSL: React.FC<{
  frag: string;
  vert: string;
  uniforms?: {
    u_mouse?: Array<number>;
    u_texture?: string;
  };
}> = ({ frag, vert, uniforms }) => {
  const animate = ({
    scene,
    camera,
    renderer,
    _uniforms,
    clock,
  }: AnimateParams) => {
    requestAnimationFrame(() =>
      animate({ scene, camera, renderer, _uniforms, clock })
    );
    _uniforms.u_time.value = performance.now() * 0.001;
    renderer.render(scene, camera);
  };
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, -1);
    scene.add(camera);
    const geometry = new PlaneBufferGeometry(2, 2);
    const _uniforms = {
      u_time: {
        type: "f",
        value: 0.0,
      },
      u_resolution: {
        type: "v2",
        value:
          uniforms !== undefined
            ? new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.innerHeight)
            : new Vector2(),
      },
      u_mouse: {
        type: "v2",
        value:
          uniforms !== undefined && uniforms.u_mouse !== undefined
            ? new Vector2(uniforms.u_mouse[0], uniforms.u_mouse[1])
            : new Vector2(),
      },
      u_texture: {
        type: "t",
        value: new TextureLoader().load(
          uniforms?.u_texture !== undefined ? uniforms.u_texture : ""
        ),
      },
    };
    const material = new RawShaderMaterial({
      uniforms: _uniforms,
      vertexShader: vert,
      fragmentShader: frag,
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
    const renderer = new WebGLRenderer({ canvas: canvas, antialias: false });
    renderer.setClearColor("#1d1d1d");
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    const clock = new Clock();
    clock.start();
    animate({ scene, camera, renderer, _uniforms, clock });
  };
  return (
    <div className="container">
      <div className="GLSLWrap">
        <canvas ref={onCanvasLoaded} />
      </div>
    </div>
  );
};

export default GLSL;
