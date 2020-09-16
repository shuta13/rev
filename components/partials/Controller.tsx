import React, { useState, useEffect } from "react";
import { AppButton } from "../common/AppButton";

export const Controller: React.FC<{
  handleOnClickButton: () => void;
  text?: string;
  file: File | null;
  setFile: (file: File | null) => void;
  setIsChanging: (prevState: boolean) => void;
}> = ({ handleOnClickButton, text, file, setFile, setIsChanging }) => {
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
      <ControllerFileInput
        handleOnChangeInput={handleOnChangeInput}
        setIsChanging={setIsChanging}
      />
      <AppButton
        handleOnClick={() => {
          handleOnClickButton();
          !text && file !== null && setIsPlaying(!isPlaying);
        }}
        text={text !== undefined ? text : playButtonText}
      />
    </div>
  );
};

const ControllerFileInput: React.FC<{
  handleOnChangeInput: (e: React.FormEvent<HTMLInputElement>) => void;
  setIsChanging: (prevState: boolean) => void;
}> = ({ handleOnChangeInput, setIsChanging }) => {
  return (
    <label className="ControllerFileInput">
      File
      <input
        type="file"
        accept="audio/*"
        onChange={handleOnChangeInput}
        onClick={(prevState) => setIsChanging(!prevState)}
      />
    </label>
  );
};
