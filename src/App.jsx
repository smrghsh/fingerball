import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Webcam from "react-webcam";
import HandPoints from "./components/Handpoints";

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
