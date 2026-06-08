import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UserPlus,
} from "lucide-react";
import instances from "../../../components/axios";
import { handleEnterNavigation } from "../../../utils/formNavigation";

function Customerregister() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [nameError, setNameError] = useState("");
  const [numberError, setNumberError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    let hasErrors = false;

    setNameError("");
    setNumberError("");

    if (!name.trim()) {
      setNameError("Customer name is required");
      hasErrors = true;
    } else if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      hasErrors = true;
    }

    if (number && (number.length < 10 || number.length > 15)) {
      setNumberError("Please enter a valid phone number");
      hasErrors = true;
    }

    return !hasErrors;
  };

  const showErrorToast = () => {
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center";
    errorDiv.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      Failed to register customer. Please try again!
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await instances.post("/customer/add", {
        customername: name.trim(),
        customernumber: number || null,
      });

      setIsSuccess(true);

      setTimeout(() => {
        setName("");
        setNumber("");
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error registering customer:", error);
      showErrorToast();
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-4 md:px-6 md:py-5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-6 w-32 h-32 md:w-96 md:h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-6 w-40 h-40 md:w-[500px] md:h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 md:w-72 md:h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content pushed upward */}
      <div className="relative z-10 flex justify-center min-h-screen pt-4 md:pt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-5 md:mb-6">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
              <span className="text-green-600">Customer Registration</span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Add new customer to your database
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Success!
                  </h3>
                  <p className="text-green-600 text-lg">
                    Customer registered successfully
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  onKeyDown={handleEnterNavigation}
                  className="space-y-5"
                >
                  {/* Customer Name */}
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Customer Name *
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        placeholder="Enter customer full name"
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 bg-white/80 backdrop-blur-sm transition-all duration-300 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl ${
                          nameError
                            ? "border-red-300 focus:ring-red-200 text-red-900"
                            : "border-green-200 focus:ring-green-300 focus:border-green-500 text-green-900"
                        }`}
                      />

                      {nameError && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center mt-2 text-red-600"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{nameError}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Phone Number */}
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      Mobile Number (Optional)
                    </label>

                    <div className="relative">
                      <input
                        type="tel"
                        value={number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setNumber(value);
                          if (numberError) setNumberError("");
                        }}
                        placeholder="e.g. 9876543210"
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 bg-white/80 backdrop-blur-sm transition-all duration-300 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl ${
                          numberError
                            ? "border-red-300 focus:ring-red-200 text-red-900"
                            : "border-blue-200 focus:ring-blue-300 focus:border-blue-500 text-blue-900"
                        }`}
                      />

                      {numberError && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center mt-2 text-red-600"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{numberError}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl transform hover:scale-[1.02] flex items-center justify-center ${
                        isLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-green-500/40"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 mr-3 border-[3px] border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          Registering Customer...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-6 h-6 mr-3" />
                          Register Customer
                          <Sparkles className="w-6 h-6 ml-3" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer Note */}
          <motion.div variants={itemVariants} className="text-center mt-4">
            <p className="text-slate-500 text-sm">
              Customer information will be securely stored in your database
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div
        className="fixed top-6 left-6 w-16 h-16 bg-green-500/20 rounded-full opacity-60 animate-bounce"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="fixed top-14 right-8 w-14 h-14 bg-emerald-500/20 rounded-full opacity-60 animate-bounce"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed bottom-12 left-10 w-10 h-10 bg-teal-500/20 rounded-full opacity-60 animate-bounce"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>
  );
}

export default Customerregister;