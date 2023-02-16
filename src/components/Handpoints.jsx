import { useRef, useEffect, useMemo, useState } from "react";
import ml5 from "ml5";
import { throttle } from "lodash";

const HandPoints = ({ webcamRef }) => {
  const [handPosition, setHandPosition] = useState(false);
  const [bufferArray, setBufferArray] = useState([]);

  const vidSize = { width: 370 / 2, height: 280 / 2 };
  const refPoints = useRef();

  // Use a memo'd throttle to prevent state updates
  // from occuring each frame.

  const throttledStateUpdate = useMemo(
    () =>
      throttle((results) => {
        setHandPosition(results);
      }, 100),
    []
  );

  useEffect(() => {
    // Set video size once
    webcamRef.current.video.width = vidSize.width;
    webcamRef.current.video.height = vidSize.height;

    // Once model is updated, ping throttledStateUpdate
    // with new updated state each frame.
    const modelLoaded = () => {
      handpose.on("hand", (results) => {
        if (results && typeof results[0] !== "undefined") {
          throttledStateUpdate(results[0]);
        }
      });
    };

    const handpose = ml5.handpose(webcamRef.current.video, modelLoaded);
  }, []);

  useEffect(() => {
    if (handPosition) {
      const positions = [];
      handPosition.landmarks.map((mark) => {
        mark.map((coord) => {
          const coordFlipped = ((coord / 100) * -1) + 2; // TODO : the "2" should be dynamic to screen size.
          positions.push(coordFlipped);
        });
      });
      // console.log(positions);
      setBufferArray(new Float32Array(positions));
    }
  }, [handPosition]);

  useEffect(() => {
    if (refPoints.current) {
      const pos = refPoints.current.geometry.getAttribute("position");
      for (let i = 0; i <= bufferArray.length; i++) {
        pos.array[i] = bufferArray[i];
      }
      refPoints.current.geometry.setAttribute("position", pos);
      refPoints.current.geometry.attributes.position.needsUpdate = true;

      refPoints.needsUpdate = true;
    }
  }, [bufferArray]);

  return (
    handPosition && (
      <group position={[0, 0, 0]}>
        <points ref={refPoints}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              array={bufferArray}
              count={bufferArray.length / 3} //
              itemSize={3}
            />
          </bufferGeometry>

          <pointsMaterial
            attach="material"
            color={"black"}
            size={0.05}
            sizeAttenuation
            transparent={true}
            alphaTest={0.5}
            opacity={0.5}
          />
        </points>
      </group>
    )
  );
};

export default HandPoints;
