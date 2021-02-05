import React, { useState, useEffect, useContext, useRef } from "react";
import "./ActionBox.css";
import ReactCursorPosition from "react-cursor-position";
import Cursor from "./Cursor";
import { SocketContext } from "../Contexts/SocketContext";

const ActionBox = (props) => {
  const { socket, connected } = useContext(SocketContext);

  const [isActive, setIsActive] = useState(false);
  const [isPositionOutside, setIsPositionOutside] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [shouldSend, setShouldSend] = useState(false);
  const [isTouchScreen, setIsTouchScreen] = useState();

  const [elementDimensions, setElementDimensions] = useState({
    width: -1,
    height: -1,
  });
  const [activeProportions, setActiveProportions] = useState({
    x: 0,
    y: 0,
  });

  const sendData = () => {
    if (shouldSend && socket && connected) {
      let data = [activeProportions.x, activeProportions.y];
      socket.send(data);
    }
  };
  // useEffect that sets up an interval that uses send data reference
  // so that it has the updated coordinates and flags for future calls.
  const sendDataRef = useRef();
  useEffect(() => {
    sendDataRef.current = sendData;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      sendDataRef.current();
    }, 1000 / 5);
    return () => clearInterval(interval);
  }, []);

  // This resets the mousedown for when the user presses down
  // the mouse within the actionbox and then drags the mouse outside.
  // since we can't detect mouseUp event outside the app, we just reset
  // the boolean when the mouse leaves the box.
  useEffect(() => {
    if (isPositionOutside) {
      setIsMouseDown(false);
    }
  }, [isPositionOutside]);

  useEffect(() => {
    if (isTouchScreen) {
      setShouldSend(isActive && !isPositionOutside);
    } else {
      setShouldSend(isActive && !isPositionOutside && isMouseDown);
    }
  }, [isActive, isPositionOutside, isTouchScreen, isMouseDown]);

  const onPositionChanged = (e) => {
    if (e.elementDimensions != null) {
      setElementDimensions({
        width: e.elementDimensions.width,
        height: e.elementDimensions.height,
      });
    }

    setIsPositionOutside(e.isPositionOutside);
    if (!e.isPositionOutside) {
      let x = e.position.x;
      let y = e.position.y;
      // Set if the elementDimensions have been set previously.
      if (elementDimensions.width !== -1 && elementDimensions.height !== -1) {
        setActiveProportions({
          x: x / elementDimensions.width,
          y: y / elementDimensions.height,
        });
      }
    }
  };

  const onActivationChanged = (e) => {
    setIsActive(e.isActive);
    sendDataRef.current();
  };

  const onDetectedEnvironmentChanged = (e) => {
    if (e.isMouseDetected) {
      setIsTouchScreen(false);
    } else {
      setIsTouchScreen(true);
    }
  };

  const onMouseDown = () => {
    setIsMouseDown(true);
  };
  const onMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <>
      <div
        className="Action-box"
        style={{
          backgroundColor: shouldSend ? "white" : "black",
          border: shouldSend ? " 2px solid black" : " 2px solid white",
          transition: "all 0.5s",
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <ReactCursorPosition
          style={{
            width: "100%",
            height: "100%",
            flexGrow: "1",
          }}
          activationInteractionTouch="touch"
          onPositionChanged={onPositionChanged}
          onActivationChanged={onActivationChanged}
          onDetectedEnvironmentChanged={onDetectedEnvironmentChanged}
        >
          <Cursor className="cursor" />
          {/* <div style={{
                        color: 'black',
                    }}>
                        isActive: {isActive ? 'true ' : 'false '}  <br />
                        isPositionOutside: {isPositionOutside ? 'true' : 'false'} <br />
                        x: {activeProportions.x}  <br />
                        y: {activeProportions.y} <br />
                    </div> */}
        </ReactCursorPosition>
      </div>
    </>
  );
};

export default ActionBox;
