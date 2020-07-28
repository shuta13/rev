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
}

let isNeedsStopAnimate = false;
let RAFId = 0;
let fftRAFId = 0;
const audioConfig: AudioConfig = {
  fftSize: 512,
  listener: null,
  audio: null,
  file: null
}

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
    audioConfig.audio.pause()
  } else {
    const audioLoader = new AudioLoader();
    audioLoader.load(audioConfig.file, (buffer) => {
      audioConfig.audio.setBuffer(buffer);
      audioConfig.audio.play();
      const analyser = new AudioAnalyser(audioConfig.audio, audioConfig.fftSize);
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
    cancelAnimationFrame(fftRAFId)
  }
};

const animate = ({
  scene,
  camera,
  renderer,
  uniforms,
  clock,
}: AnimateParams) => {
  RAFId = requestAnimationFrame(() =>
    animate({ scene, camera, renderer, uniforms, clock })
  );
  if (isNeedsStopAnimate) return;
  uniforms.time.value += clock.getDelta();
  renderer.render(scene, camera);
};

const GLSL: React.FC = () => {
  let uniforms;
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);
    scene.add(camera);
    const geometry = new PlaneBufferGeometry(2, 2);
    uniforms = {
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
      uniforms: uniforms,
      vertexShader: vert.default,
      fragmentShader: frag.default,
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
    const clock = new Clock();
    clock.start();
    const renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      depth: false,
    });
    renderer.setClearColor(0x1d1d1d);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    window.addEventListener("resize", () => handleResize(renderer));

    // audio init
    audioConfig.fftSize = 512;
    audioConfig.listener = new AudioListener();
    audioConfig.audio = new Audio(audioConfig.listener);
    audioConfig.file = "/audio/set-me-free.mp3"

    animate({ scene, camera, renderer, uniforms, clock });
  };
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
      <Controller propOnClick={() => handleOnClick(uniforms)} />
    </>
  );
};

export default GLSL;
