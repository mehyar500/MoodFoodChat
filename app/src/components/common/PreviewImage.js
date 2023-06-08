import React from "react";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const PreviewImage = ({ src, alt, onRemove, size = 100 }) => {
    return (
      <div style={{ position: "relative", display: "inline-block", width: size, height: size }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
        <IconButton
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            background: "rgba(255, 255, 255, 0.75)",
            padding: "2px",
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </div>
    );
  };  

export default PreviewImage;
