import { resolve } from "path";
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

interface GetSpectrumByFftParams {
  analyser: AudioAnalyser;
  uniforms: any;
}

interface Config {
  isNeedsStopAnimate: boolean;
  RAFId: number;
  fftRAFId: number;
  scene: Scene | null;
  camera: OrthographicCamera | null;
  renderer: WebGLRenderer | null;
  uniforms: {
    time: {
      type: "f";
      value: number;
    };
    resolution: {
      type: "v2";
      value: Vector2;
    };
    audioTexture: {
      type: "t";
      value: DataTexture | null;
    };
  };
  clock: Clock | null;
  audio: Audio | null;
}

const GLSL: React.FC = () => {
  // animation
  // const [isNeedsStopAnimate, setIsNeedsStopAnimate] = useState(false);
  // const [RAFId, setRAFId] = useState(0);
  // const [fftRAFId, setFftRAFId] = useState(0);

  // audio
  const [fftSize] = useState(512);
  const [audioFile, setAudioFile] = useState<string | ArrayBuffer | null>(null);
  const [isExistAudioFile, setIsExistAudioFile] = useState(false);

  // for controller (input file)
  const [file, setFile] = useState<File | null>(null);

  // three config
  // const [scene, setScene] = useState<Scene | null>(null);
  // const [camera, setCamera] = useState<OrthographicCamera | null>(null);
  // const [renderer, setRenderer] = useState<WebGLRenderer | null>(null);
  // const [clock, setClock] = useState<Clock | null>(null);

  const config: Config = {
    isNeedsStopAnimate: false,
    RAFId: 0,
    fftRAFId: 0,
    scene: null,
    camera: null,
    renderer: null,
    uniforms: {
      time: {
        type: "f",
        value: 0.0,
      },
      resolution: {
        type: "v2",
        value: new Vector2(),
      },
      audioTexture: {
        type: "t",
        value: null,
      },
    },
    clock: null,
    audio: null,
  };

  const handleResize = () => {
    config.isNeedsStopAnimate = true;
    config.renderer?.setSize(window.innerWidth, window.innerHeight);
    config.isNeedsStopAnimate = false;
  };

  const getSpectrumByFft = (
    analyser: GetSpectrumByFftParams["analyser"],
    uniforms: GetSpectrumByFftParams["uniforms"]
  ) => {
    analyser.getFrequencyData();
    uniforms.audioTexture.value.needsUpdate = true;
    config.fftRAFId = requestAnimationFrame(() => {
      getSpectrumByFft(analyser, uniforms);
    });
  };

  const handleOnClick = () => {
    if (config.audio?.isPlaying) {
      config.audio.pause();
    } else {
      const audioLoader = new AudioLoader();
      if (audioFile !== null) {
        audioLoader.load(audioFile as string, (buffer) => {
          if (config.audio !== null) {
            config.audio.setBuffer(buffer);
            config.audio.play();
            const analyser = new AudioAnalyser(config.audio, fftSize);
            config.uniforms.audioTexture.value = new DataTexture(
              analyser.data,
              fftSize / 2,
              1,
              LuminanceFormat
            );
            getSpectrumByFft(analyser, config.uniforms);
          }
        });
      }
    }

    if (config.fftRAFId !== 0) {
      cancelAnimationFrame(config.fftRAFId);
    }
  };

  const convertFile = () => {
    const reader = new FileReader();

    const load = new Promise(
      (
        resolve: (e: string | ArrayBuffer | null | undefined) => void,
        reject
      ) => {
        try {
          reader.onload = (e) => {
            file !== null && resolve(e.target?.result);
          };
        } catch (e) {
          reject(e);
        }
      }
    );

    file !== null && reader.readAsDataURL(file);

    return load;
  };

  useEffect(() => {
    file !== null &&
      convertFile().then((result) => {
        setAudioFile(result);
      });
  }, [file]);

  useEffect(() => {
    setIsExistAudioFile(audioFile !== null);
  }, [audioFile]);

  useEffect(() => {
    if (config.scene !== null && config.camera !== null && isExistAudioFile) {
      config.renderer?.render(config.scene, config.camera);
      animate();
    }
  }, [isExistAudioFile]);

  useEffect(() => {
    return () => {
      window.removeEventListener("resize", () => handleResize);
      cancelAnimationFrame(config.RAFId);
      cancelAnimationFrame(config.fftRAFId);
    };
  });

  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;

    config.scene = new Scene();
    config.camera = new OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    config.camera.position.set(0, 0, 100);
    config.camera.lookAt(config.scene.position);
    config.scene.add(config.camera);

    const geometry = new PlaneBufferGeometry(2, 2);

    config.uniforms.resolution.value = new Vector2(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );

    const material = new RawShaderMaterial({
      uniforms: config.uniforms,
      vertexShader: vert.default,
      fragmentShader: frag.default,
    });
    const mesh = new Mesh(geometry, material);
    config.scene.add(mesh);

    config.clock = new Clock();
    config.clock.start();

    config.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      depth: false,
    });
    config.renderer.setClearColor(0xffffff);
    config.renderer.setPixelRatio(window.devicePixelRatio);
    config.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", handleResize);

    const listener = new AudioListener();
    config.audio = new Audio(listener);
  };

  const animate = () => {
    config.RAFId = requestAnimationFrame(() => animate());
    if (config.isNeedsStopAnimate) return;
    config.uniforms.time.value += config.clock?.getDelta()!!;
    if (config.scene !== null && config.camera !== null)
      config.renderer?.render(config.scene, config.camera);
  };

  return (
    <>
      <canvas ref={onCanvasLoaded} className="PlayerCanvas" />
      <Controller handleOnClick={handleOnClick} file={file} setFile={setFile} />
    </>
  );
};

export default GLSL;
