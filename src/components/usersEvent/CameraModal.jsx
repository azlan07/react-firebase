import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaRedo } from 'react-icons/fa';

const CameraModal = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setPhoto(null);
  };

  const handleConfirm = () => {
    onCapture(photo);
    onClose();
  };

  return (
    <dialog id="camera_modal" className="modal">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Attendance Photo Confirmation</h3>
        <div className="flex flex-col items-center space-y-4">
          {!photo ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              />
              <button 
                className="btn btn-primary btn-circle btn-lg"
                onClick={capture}
              >
                <FaCamera className="text-xl" />
              </button>
            </>
          ) : (
            <>
              <img 
                src={photo} 
                alt="Attendance capture" 
                className="w-full rounded-lg"
              />
              <div className="flex gap-4">
                <button 
                  className="btn btn-ghost btn-circle btn-lg"
                  onClick={retake}
                >
                  <FaRedo className="text-xl" />
                </button>
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleConfirm}
                >
                  Confirm Attendance
                </button>
              </div>
            </>
          )}
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default CameraModal;
