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

const GLSL: React.FC = () => {
  // animation
  const [isNeedsStopAnimate, setIsNeedsStopAnimate] = useState(false);
  const [RAFId, setRAFId] = useState(0);
  const [fftRAFId, setFftRAFId] = useState(0);

  // audio
  const [audio, setAudio] = useState<Audio | null>(null);
  const [fftSize] = useState(512);
  const [audioFile, setAudioFile] = useState<string | ArrayBuffer | null>(null);
  const [isExistAudioFile, setIsExistAudioFile] = useState(false);

  // for controller (input file)
  const [file, setFile] = useState<File | null>(null);

  // three config
  const [scene, setScene] = useState<Scene | null>(null);
  const [camera, setCamera] = useState<OrthographicCamera | null>(null);
  const [renderer, setRenderer] = useState<WebGLRenderer | null>(null);
  const [clock, setClock] = useState<Clock | null>(null);

  const canvas = useRef<HTMLCanvasElement>(null);

  const uniforms = {
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
      value: null as DataTexture | null,
    },
  };

  const handleResize = () => {
    setIsNeedsStopAnimate(true);
    renderer?.setSize(window.innerWidth, window.innerHeight);
    setIsNeedsStopAnimate(false);
  };

  const getSpectrumByFft = ({ analyser, uniforms }: GetSpectrumByFftParams) => {
    analyser.getFrequencyData();
    uniforms.audioTexture.value.needsUpdate = true;
    setFftRAFId(
      requestAnimationFrame(() => {
        getSpectrumByFft({ analyser, uniforms });
      })
    );
  };

  const handleOnClick = () => {
    if (audio?.isPlaying) {
      audio.pause();
    } else {
      const audioLoader = new AudioLoader();
      if (audioFile !== null) {
        audioLoader.load(audioFile as string, (buffer) => {
          if (audio !== null) {
            audio.setBuffer(buffer);
            console.log(audio);
            audio.play();
            const analyser = new AudioAnalyser(audio, fftSize);
            uniforms.audioTexture.value = new DataTexture(
              analyser.data,
              fftSize / 2,
              1,
              LuminanceFormat
            );
            getSpectrumByFft({ analyser, uniforms });
          }
        });
      }
    }

    if (fftRAFId !== 0) {
      cancelAnimationFrame(fftRAFId);
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
    // three init
    setScene(new Scene());
    setCamera(new OrthographicCamera(-1, 1, 1, -1, 1, 1000));

    uniforms.resolution.value = new Vector2(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );

    setClock(new Clock());
    if (canvas.current != null) {
      const renderer = new WebGLRenderer({
        canvas: canvas.current,
        antialias: false,
        alpha: false,
        stencil: false,
        depth: false,
      });
      setRenderer(renderer);
      onCanvasLoaded();
    }
  }, []);

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
    if (scene !== null && camera !== null && isExistAudioFile)
      renderer?.render(scene, camera);
    animate();
  }, [isExistAudioFile]);

  useEffect(() => {
    return () => {
      window.removeEventListener("resize", () => handleResize);
      cancelAnimationFrame(RAFId);
      cancelAnimationFrame(fftRAFId);
    };
  });

  const onCanvasLoaded = () => {
    if (!canvas.current) return;

    camera?.position.set(0, 0, 100);
    scene?.position !== undefined && camera?.lookAt(scene?.position);
    camera !== null && scene?.add(camera);

    const geometry = new PlaneBufferGeometry(2, 2);

    const material = new RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: vert.default,
      fragmentShader: frag.default,
    });

    const mesh = new Mesh(geometry, material);
    scene?.add(mesh);

    clock?.start();

    renderer?.setClearColor(0xffffff);
    renderer?.setPixelRatio(window.devicePixelRatio);
    renderer?.setSize(window.innerWidth, window.innerHeight);

    renderer !== null && window.addEventListener("resize", handleResize);

    setAudio(new Audio(new AudioListener()));
  };

  const animate = () => {
    setRAFId(requestAnimationFrame(() => animate()));
    if (isNeedsStopAnimate) return;
    uniforms.time.value += clock?.getDelta()!!;
    if (scene !== null && camera !== null) renderer?.render(scene, camera);
  };

  return (
    <>
      <canvas ref={canvas} className="PlayerCanvas" />
      <Controller handleOnClick={handleOnClick} file={file} setFile={setFile} />
    </>
  );
};

export default GLSL;
