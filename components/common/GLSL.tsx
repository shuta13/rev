import React, { useState, useEffect, useRef } from "react";
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
  DataTexture
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
}

const GLSL: React.FC = () => {
  let isNeedsStopAnimate = false;
  let RAFId = 0;
  let fftRAFId = 0;
  const handleResize = (renderer: WebGLRenderer) => {
    isNeedsStopAnimate = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    isNeedsStopAnimate = false;
  };
  const getSpectrumByFft = ({ analyser, spectrumArray }: GetSpectrumByFftParams) => {
    analyser.getByteFrequencyData(spectrumArray)
    console.log(spectrumArray)

    fftRAFId = requestAnimationFrame(() => {
      getSpectrumByFft({ analyser, spectrumArray })
    })
  }
  const handleOnClick = () => {
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()

    // fft config
    analyser.fftSize = 256
    // array(half of fft size)
    const spectrumArray = new Uint8Array(analyser.frequencyBinCount)

    // play audio
    const audio = new Audio()
    audio.loop = true;
    audio.autoplay = true;
    audio.crossOrigin = "anonymous"
    audio.addEventListener("canplay", () => {
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      // exec fft
      getSpectrumByFft({ analyser, spectrumArray })
    })
    audio.src = "/audio/set-me-free.mp3"
    audio.load()
  }
  const animate = ({
    scene,
    camera,
    renderer,
    uniforms,
    clock
  }: AnimateParams) => {
    RAFId = requestAnimationFrame(() =>
      animate({ scene, camera, renderer, uniforms, clock })
    );
    if (isNeedsStopAnimate) return;
    uniforms.time.value += clock.getDelta();
    renderer.render(scene, camera);
  };
  useEffect(() => {
    return () => {
      cancelAnimationFrame(RAFId)
      cancelAnimationFrame(fftRAFId)
    }
  });
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);
    scene.add(camera);
    const geometry = new PlaneBufferGeometry(2, 2);
    const uniforms = {
      time: {
        type: "f",
        value: 0.0
      },
      resolution: {
        type: "v2",
        value: new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio)
      }
    };
    const material = new RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: vert.default,
      fragmentShader: frag.default
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
      depth: false
    });
    renderer.setClearColor(0x1d1d1d);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    window.addEventListener("resize", () => handleResize(renderer));
    animate({ scene, camera, renderer, uniforms, clock });
  };
  useEffect(() => {
    return () => window.removeEventListener("resize", () => handleResize);
  });
  return (
    <>
      <canvas ref={onCanvasLoaded} className="GLSLWrap" />
      <button onClick={handleOnClick} className="GLSLPlayButton">Play</button>
    </>
  );
};

export default GLSL;
