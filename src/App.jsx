import { useRef, useEffect, useMemo, useState } from "react";
import ml5 from "ml5";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { throttle } from "lodash";
import Webcam from "react-webcam";

const HandPoints = ({ webcamRef }) => {
  const [handPosition, setHandPosition] = useState(false);
  const [bufferArray, setBufferArray] = useState([]);

  const vidSize = { width: 370 / 2, height: 280 / 2 };
  const refPoints = useRef();

  // Use a memo'd throttle to prevent state updates
  // from occuring each frame.

  const rad2Deg = (rad) => THREE.MathUtils.radToDeg(rad);

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
        mark.map(coord => {
          const coordFlipped = (coord * -1) / 50;
          positions.push(coordFlipped);
        })
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
          <bufferGeometry
            attach="geometry"
          >
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

const App = () => {
  const webcamRef = useRef();

  return (
    <div className="App">
      <div className="Webcam" style={{ position: "fixed", left: 0, top: 0 }}>
        <Webcam ref={webcamRef} mirrored />
      </div>

      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <HandPoints webcamRef={webcamRef} />

        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={"orange"} />
        </mesh>

        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default App;
