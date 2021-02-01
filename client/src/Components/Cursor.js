import React from "react";

const Cursor = (props) => {
  return (
    <div
      className="cursor"
      style={{
        left: props.position.x + "px",
        top: props.position.y + "px",
        opacity: props.isActive && !props.isPositionOutside ? 1 : 0,
      }}
    />
  );
};

export default Cursor;
