import React, { useState, useEffect, useRef } from "react";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
  Clock,
  DataTexture,
  Audio,
  AudioListener,
  AudioLoader,
  AudioAnalyser,
  LuminanceFormat,
} from "three";
import { Controller } from "./Controller";

const vert = require("../../assets/shaders/index.vert");
const frag = require("../../assets/shaders/index.frag");

type AnimateParams = {
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
  uniforms: any;
  clock: Clock;
};
type GetSpectrumByFftParams = {
  analyser: AudioAnalyser;
  uniforms: any;
};
type AudioConfig = {
  fftSize: number;
  listener: AudioListener | null;
  audio: Audio | null;
  file: string | null;
};
type SceneConfig = {
  scene: Scene | null;
  camera: OrthographicCamera | null;
  renderer: WebGLRenderer | null;
  uniforms: any | null;
  clock: Clock | null;
}

let isNeedsStopAnimate = false;
let RAFId = 0;
let fftRAFId = 0;
const audioConfig: AudioConfig = {
  fftSize: 512,
  listener: null,
  audio: null,
  file: null,
};

const handleResize = (renderer: WebGLRenderer) => {
  isNeedsStopAnimate = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  isNeedsStopAnimate = false;
};

const getSpectrumByFft = ({ analyser, uniforms }: GetSpectrumByFftParams) => {
  analyser.getFrequencyData();
  uniforms.audioTexture.value.needsUpdate = true;
  fftRAFId = requestAnimationFrame(() => {
    getSpectrumByFft({ analyser, uniforms });
  });
};

const handleOnClick = (uniforms) => {
  if (audioConfig.audio.isPlaying) {
    audioConfig.audio.pause();
  } else {
    const audioLoader = new AudioLoader();
    audioLoader.load(audioConfig.file, (buffer) => {
      audioConfig.audio.setBuffer(buffer);
      audioConfig.audio.play();
      const analyser = new AudioAnalyser(
        audioConfig.audio,
        audioConfig.fftSize
      );
      uniforms.audioTexture.value = new DataTexture(
        analyser.data,
        audioConfig.fftSize / 2,
        1,
        LuminanceFormat
      );
      getSpectrumByFft({ analyser, uniforms });
    });
  }

  if (fftRAFId !== 0) {
    cancelAnimationFrame(fftRAFId);
  }
};

const GLSL: React.FC = () => {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState(null);

  const sceneConfig: SceneConfig = {
    scene: null,
    camera: null,
    renderer: null,
    uniforms: null,
    clock: null
  }

  const animate = () => {
    RAFId = requestAnimationFrame(() =>
      animate()
    );
    if (isNeedsStopAnimate) return;
    sceneConfig.uniforms.time.value += sceneConfig.clock.getDelta();
    sceneConfig.renderer.render(sceneConfig.scene, sceneConfig.camera);
  };

  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    sceneConfig.scene = new Scene();
    sceneConfig.camera = new OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    sceneConfig.camera.position.set(0, 0, 100);
    sceneConfig.camera.lookAt(sceneConfig.scene.position);
    sceneConfig.scene.add(sceneConfig.camera);
    const geometry = new PlaneBufferGeometry(2, 2);
    sceneConfig.uniforms = {
      time: {
        type: "f",
        value: 0.0,
      },
      resolution: {
        type: "v2",
        value: new Vector2(
          window.innerWidth * window.devicePixelRatio,
          window.innerHeight * window.devicePixelRatio
        ),
      },
      audioTexture: {
        type: "t",
        value: null,
      },
    };
    const material = new RawShaderMaterial({
      uniforms: sceneConfig.uniforms,
      vertexShader: vert.default,
      fragmentShader: frag.default,
    });
    const mesh = new Mesh(geometry, material);
    sceneConfig.scene.add(mesh);
    sceneConfig.clock = new Clock();
    sceneConfig.clock.start();
    sceneConfig.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      depth: false,
    });
    sceneConfig.renderer.setClearColor(0xffffff);
    sceneConfig.renderer.setPixelRatio(window.devicePixelRatio);
    sceneConfig.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", () => handleResize(sceneConfig.renderer));

    // audio init
    audioConfig.fftSize = 512;
    audioConfig.listener = new AudioListener();
    audioConfig.audio = new Audio(audioConfig.listener);
    audioConfig.file = "/audio/set-me-free.mp3";
  };
  useEffect(() => {
    if (file !== null) {
      sceneConfig.renderer.render(sceneConfig.scene, sceneConfig.camera);
      animate();
    }
  }, [file])
  useEffect(() => {
    return () => {
      window.removeEventListener("resize", () => handleResize);
      cancelAnimationFrame(RAFId);
      cancelAnimationFrame(fftRAFId);
    };
  });
  return (
    <>
      <canvas ref={onCanvasLoaded} className="PlayerCanvas" />
      <Controller
        propOnClick={() => handleOnClick(sceneConfig.uniforms)}
        fileInput={fileInput}
        setFile={setFile}
      />
    </>
  );
};

export default GLSL;
