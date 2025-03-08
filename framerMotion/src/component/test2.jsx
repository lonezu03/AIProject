import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";


const TeachableMachine = () => {
  const webcamContainerRef = useRef(null);
  const labelContainerRef = useRef(null);
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const maxPredictionsRef = useRef(null);

  // URL của model từ Teachable Machine
  const URL = "https://teachablemachine.withgoogle.com/models/geINU3Gyn/";

  // Hàm khởi tạo model và webcam
  const init = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load model
    modelRef.current = await tmImage.load(modelURL, metadataURL);
    maxPredictionsRef.current = modelRef.current.getTotalClasses();

    // Thiết lập webcam
    const flip = true;
    webcamRef.current = new tmImage.Webcam(200, 200, flip);
    await webcamRef.current.setup(); // Yêu cầu quyền truy cập webcam
    await webcamRef.current.play();
    window.requestAnimationFrame(loop);

    // Thêm canvas webcam vào DOM
    webcamContainerRef.current.appendChild(webcamRef.current.canvas);

    // Tạo các div cho label
    for (let i = 0; i < maxPredictionsRef.current; i++) {
      labelContainerRef.current.appendChild(document.createElement("div"));
    }
  };

  // Vòng lặp cập nhật webcam và dự đoán
  const loop = async () => {
    webcamRef.current.update();
    await predict();
    window.requestAnimationFrame(loop);
  };

  // Hàm dự đoán
  const predict = async () => {
    const prediction = await modelRef.current.predict(webcamRef.current.canvas);
    for (let i = 0; i < maxPredictionsRef.current; i++) {
      const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
    }
  };

  // Khởi động khi component mount
  useEffect(() => {
    // Cleanup khi component unmount
    return () => {
      if (webcamRef.current) {
        webcamRef.current.stop(); // Dừng webcam khi unmount
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div>Teachable Machine Image Model</div>
      <button
        type="button"
        onClick={init}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start
      </button>
      <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
  ref={webcamContainerRef}
/>      <div ref={labelContainerRef} id="label-container" className="text-center"></div>
    </div>
  );
};

export default TeachableMachine;