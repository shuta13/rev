import React from "react";
import { AppButton } from "../common/AppButton"

export const Controller: React.FC<{ propOnClick: () => void }> = ({ propOnClick }) => {
  return (
    <div className="Controller">
      <AppButton
        propOnClick={propOnClick}
        text="Play"
      />
    </div>
  )
}
