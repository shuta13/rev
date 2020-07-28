import React, { useState, useEffect } from "react";
import { AppButton } from "../common/AppButton"

export const Controller: React.FC<{ propOnClick?: () => void; text?: string }> = ({ propOnClick, text }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playButtonText, setPlayButtonText] = useState("Play")
  useEffect(() => {
    isPlaying ? setPlayButtonText("Pause") : setPlayButtonText("Play")
  }, [isPlaying])
  return (
    <div className="Controller">
      <AppButton
        propOnClick={
          () => {
            propOnClick()
            setIsPlaying(!isPlaying)
          }
        }
        text={text !== undefined ? text : playButtonText}
      />
    </div>
  )
}
