import React, { useState, useEffect } from "react";
import { AppButton } from "../common/AppButton";

export const Controller: React.FC<{
  handleOnClick: () => void;
  text?: string;
  file: File | null;
  setFile: (file: File | null) => void;
}> = ({ handleOnClick, text, file, setFile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playButtonText, setPlayButtonText] = useState("Play");

  useEffect(() => {
    isPlaying ? setPlayButtonText("Pause") : setPlayButtonText("Play");
  }, [isPlaying]);

  const handleOnChangeInput = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.files);
    e.currentTarget.files !== null && setFile(e.currentTarget.files[0]);
  };

  return (
    <div className="Controller">
      <div className="ControllerNP">{file !== null ? file.name : "None"}</div>
      <ControllerFileInput handleOnChangeInput={handleOnChangeInput} />
      <AppButton
        handleOnClick={() => {
          handleOnClick();
          !text && file !== null && setIsPlaying(!isPlaying);
        }}
        text={text !== undefined ? text : playButtonText}
      />
    </div>
  );
};

const ControllerFileInput: React.FC<{
  handleOnChangeInput: (e: React.FormEvent<HTMLInputElement>) => void;
}> = ({ handleOnChangeInput }) => {
  return (
    <label className="ControllerFileInput">
      File
      <input type="file" accept="audio/*" onChange={handleOnChangeInput} />
    </label>
  );
};
