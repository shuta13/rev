import React from "react";

export const AppButton: React.FC<{ propOnClick?: () => void, text: string }> = ({ propOnClick, text }) => {
  return (
    <button
      onClick={propOnClick}
      className="AppButton"
    >
      { text }
    </button>
  )
}
