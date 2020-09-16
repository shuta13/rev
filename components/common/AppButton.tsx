import React from "react";

export const AppButton: React.FC<{
  handleOnClick?: () => void;
  text: string;
}> = ({ handleOnClick, text }) => {
  return (
    <button onClick={handleOnClick} className="AppButton">
      {text}
    </button>
  );
};
