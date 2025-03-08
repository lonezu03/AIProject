import { motion } from "framer-motion";

const PaymentButton = ({ onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }} // Hiệu ứng co lại khi nhấn
      transition={{ type: "spring", stiffness: 300, damping: 10 }} // Hiệu ứng spring mượt mà
      onClick={onClick} // Sử dụng hàm onClick từ prop
      className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 focus:outline-none"
    >
      Thanh toán
    </motion.button>
  );
};

export default PaymentButton;