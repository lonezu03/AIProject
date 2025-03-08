import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as tf from "@tensorflow/tfjs";
import PaymentButton from "./PaymentButton";
import * as tmImage from "@teachablemachine/image";

// Danh sách sản phẩm
const products = [
  { name: "Đồng hồ", description: "Đồng hồ đeo tay thời trang", price: 500000, type: "Phụ kiện" },
  { name: "Cuốn sổ", description: "Sổ tay ghi chú cao cấp", price: 30000, type: "Văn phòng phẩm" },
  { name: "Loa", description: "Loa Bluetooth mini", price: 250000, type: "Điện tử" },
  { name: "Quạt", description: "Quạt USB cầm tay", price: 150000, type: "Đồ gia dụng" },
  { name: "Bút", description: "Bút bi cao cấp", price: 10000, type: "Văn phòng phẩm" },
  { name: "Loa bluetooth", description: "Loa Bluetooth chất lượng cao", price: 300000, type: "Điện tử" },
  { name: "Cái quạt", description: "Quạt để bàn", price: 200000, type: "Đồ gia dụng" },
  { name: "Chuột máy tính", description: "Chuột không dây", price: 120000, type: "Điện tử" },
  { name: "Máy Tính Casio", description: "Máy tính bỏ túi Casio", price: 150000, type: "Điện tử" }
];

const TeachableMachine = () => {
  const webcamContainerRef = useRef(null);
  const labelContainerRef = useRef(null);
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const maxPredictionsRef = useRef(null);
  const lastPredictionTimeRef = useRef(0); // Thời gian dự đoán cuối cùng

  const [totalPayment, setTotalPayment] = useState(0); // Tổng thanh toán
  const [detectedProduct, setDetectedProduct] = useState(null); // Sản phẩm được nhận diện

  // URL của model từ Teachable Machine
  const URL = "https://teachablemachine.withgoogle.com/models/cUJHs570z/";

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
    const currentTime = Date.now();
    if (currentTime - lastPredictionTimeRef.current < 3000) return; // Delay 3 giây

    const prediction = await modelRef.current.predict(webcamRef.current.canvas);
    for (let i = 0; i < maxPredictionsRef.current; i++) {
      // Kiểm tra xác suất dự đoán > 80%
      if (prediction[i].probability > 0.8) {
        const product = products.find((p) => p.name === prediction[i].className);
        if (product) {
          setDetectedProduct(product); // Cập nhật sản phẩm được nhận diện
          setTotalPayment((prev) => prev + product.price); // Cộng tiền vào tổng thanh toán
          lastPredictionTimeRef.current = currentTime; // Cập nhật thời gian dự đoán cuối cùng
        }
      }
    }
  };

  // Hàm xử lý thanh toán
  const handlePayment = () => {
    setDetectedProduct(null); // Reset sản phẩm được nhận diện
    setTotalPayment(0); // Reset tổng thanh toán
    alert("Thanh toán thành công!");
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl text-center"
      >
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Teachable Machine Image Model
        </h1>

        <button
          type="button"
          onClick={init}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Start
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          ref={webcamContainerRef}
          className="w-[200px] h-[200px] mx-auto my-6 border-2 border-blue-200 rounded-lg overflow-hidden"
        />

        <div ref={labelContainerRef} id="label-container" className="text-center">
          {detectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="text-xl font-semibold text-blue-800">Sản phẩm được nhận diện:</h3>
              <p className="text-gray-700"><strong>Tên:</strong> {detectedProduct.name}</p>
              <p className="text-gray-700"><strong>Mô tả:</strong> {detectedProduct.description}</p>
              <p className="text-gray-700"><strong>Giá:</strong> {detectedProduct.price.toLocaleString()} VND</p>
            </motion.div>
          )}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-800">
            Tổng thanh toán: {totalPayment.toLocaleString()} VND
          </h2>
        </div>

        <div className="mt-6">
          <PaymentButton onClick={handlePayment} />
        </div>
      </motion.div>
    </div>
  );
};

export default TeachableMachine;