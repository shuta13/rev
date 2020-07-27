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
  RGBFormat,
} from "three";

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
  analyser: AnalyserNode;
  spectrumArray: Uint8Array;
  uniforms: any;
};

let isNeedsStopAnimate = false;
let RAFId = 0;
let fftRAFId = 0;

const handleResize = (renderer: WebGLRenderer) => {
  isNeedsStopAnimate = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  isNeedsStopAnimate = false;
};

const getSpectrumByFft = ({
  analyser,
  spectrumArray,
  uniforms
}: GetSpectrumByFftParams) => {
  analyser.getByteFrequencyData(spectrumArray);

  const audioTexture = new DataTexture(
    spectrumArray,
    analyser.frequencyBinCount,
    analyser.frequencyBinCount,
    RGBFormat
  );

  uniforms["audioTexture"] = {
    type: "t",
    value: audioTexture
  }

  // console.log(uniforms)

  fftRAFId = requestAnimationFrame(() => {
    getSpectrumByFft({ analyser, spectrumArray, uniforms });
  });
};

const handleOnClick = (uniforms) => {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();

  // fft config
  analyser.fftSize = 2048;
  // array(half of fft size)
  const spectrumArray = new Uint8Array(analyser.frequencyBinCount);

  // play audio
  const audio = new Audio();
  audio.loop = true;
  audio.autoplay = true;
  audio.crossOrigin = "anonymous";
  audio.addEventListener("canplay", () => {
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    // exec fft
    getSpectrumByFft({ analyser, spectrumArray, uniforms });
  });
  audio.src = "/audio/set-me-free.mp3";
  audio.load();
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
    animate({ scene, camera, renderer, uniforms, clock });
  };
  useEffect(() => {
    return () => {
      window.removeEventListener("resize", () => handleResize)
      cancelAnimationFrame(RAFId);
      cancelAnimationFrame(fftRAFId);
    };
  });
  return (
    <>
      <canvas ref={onCanvasLoaded} className="GLSLWrap" />
      <button onClick={() => handleOnClick(uniforms)} className="GLSLPlayButton">
        Play
      </button>
    </>
  );
};

export default GLSL;
