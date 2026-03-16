import { useState } from 'react';
import Scene from './components/Scene';
import LoadingScreen from './components/LoadingScreen';
import ComputerOverlay from './components/ComputerOverlay';

export default function App() {
  const [ready, setReady]               = useState(false);
  const [computerMode, setComputerMode] = useState(false);
  const [overlayVisible, setOverlay]    = useState(false);

  function handleEnterComputer() {
    setComputerMode(true);
    // Overlay appears after camera zoom-in completes (~0.8s)
    // onComputerArrived fires it precisely, but we also set a fallback timer
  }

  function handleComputerArrived() {
    setOverlay(true);
  }

  function handleCloseComputer() {
    setOverlay(false);
    // Small delay so the overlay fades out before camera pulls back
    setTimeout(() => setComputerMode(false), 420);
  }

  return (
    <>
      {/* Loading gate */}
      {!ready && <LoadingScreen onLoaded={() => setReady(true)} />}

      {/* 3D scene — always mounted */}
      <div style={{ width: '100vw', height: '100vh' }}>
        <Scene
          computerMode={computerMode}
          onEnterComputer={handleEnterComputer}
          onComputerArrived={handleComputerArrived}
        />
      </div>

      {/* GitHub desktop overlay */}
      {overlayVisible && <ComputerOverlay onClose={handleCloseComputer} />}

      {/* Hint bar (only when not in overlay) */}
      {ready && !overlayVisible && (
        <p className="hint-overlay">
          DRAG to orbit &nbsp;·&nbsp; SCROLL to zoom &nbsp;·&nbsp;
          W A S D to move character &nbsp;·&nbsp;
          <span style={{ color: '#00f5ff' }}>CLICK any monitor</span> to enter computer
        </p>
      )}
    </>
  );
}
