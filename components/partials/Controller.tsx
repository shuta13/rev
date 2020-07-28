import React, { useState, useEffect, Ref } from "react";
import { AppButton } from "../common/AppButton";

export const Controller: React.FC<{
  propOnClick?: () => void;
  text?: string;
  fileInput: React.MutableRefObject<HTMLInputElement> | null;
  setFile: (file) => void
}> = ({ propOnClick, text, fileInput, setFile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playButtonText, setPlayButtonText] = useState("Play");
  useEffect(() => {
    isPlaying ? setPlayButtonText("Pause") : setPlayButtonText("Play");
  }, [isPlaying]);
  return (
    <div className="Controller">
      <label>
        <input
          type="file"
          accept="audio/*"
          ref={fileInput}
          onChange={() => setFile(fileInput.current.files[0])}
        />
      </label>
      <AppButton
        propOnClick={() => {
          propOnClick();
          if (!text) setIsPlaying(!isPlaying);
        }}
        text={text !== undefined ? text : playButtonText}
      />
    </div>
  );
};
