import React, { Fragment } from "react";
import GLSL from "../components/common/GLSL";

const vert = require("../assets/shaders/play/index.vert")
const frag = require("../assets/shaders/play/index.frag")

const Play: React.FC = () => {
  return (
    <>
      <GLSL
        vert={vert.default}
        frag={frag.default}
        uniforms={{}}
      />
    </>
  );
};

export default Play;
