// pages/Stock/ItemRegister.jsx - PROFESSIONAL NOTIFICATION VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Package, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import insatnces from '../../../components/axios';
import { handleEnterNavigation } from '../../../utils/formNavigation';
function ItemRegister({ onClose }) {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemname, setItemname] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PROFESSIONAL NOTIFICATION STATE ---
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  
useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked ✅");

    if (!itemname.trim()) {
      setNameError("This field is required");
      return;
    } else {
      setNameError("");
    }

    setIsSubmitting(true);

    try {
      await insatnces.post("/item/register", { itemname });
      
      // SHOW SUCCESS TOAST
      setToast({ show: true, message: 'Item successfully saved ✅', type: 'success' });

      setItemname("");
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
        if (onClose) onClose();
      }, 3000);

    } catch (error) {
      console.error("Error saving item:", error);
      
      // SHOW ERROR TOAST
      setToast({ show: true, message: 'Something went wrong!', type: 'error' });

      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
      
      {/* --- PROFESSIONAL TOAST UI --- */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-500 animate-in slide-in-from-right-10 ${
          toast.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
            : 'bg-gradient-to-r from-red-500 to-pink-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative pt-12 pb-20"> 
        <div className="container mx-auto px-4">
          
          <div className={`text-center mb-6 transform transition-all duration-1000 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-2 leading-tight">
              Item <span className="text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text">Registration</span>
            </h1>
          </div>

          <div className={`max-w-2xl mx-auto transform transition-all duration-1000 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_theme(colors.green.500)_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
              </div>

              <div className="text-center mb-6 relative z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
                  <Package className="w-7 h-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">📝 Register New Item</h2>
                <p className="text-slate-600 text-sm">Fill in the details below to add a new item to your inventory</p>
              </div>

<form
  onSubmit={handleSubmit}
  onKeyDown={handleEnterNavigation}
  className="space-y-4 relative z-10"
>                <div className="space-y-2">
                  <label htmlFor="itemname" className="block text-slate-700 font-semibold text-sm">
                    Item Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="itemname"
                      value={itemname}
                      onChange={(e) => setItemname(e.target.value)}
                      placeholder="e.g. Tomato, Onion, Carrot..."
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        nameError 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                      } outline-none transition-all duration-300 bg-white/90 backdrop-blur-xl`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Leaf className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  {nameError && (
                    <div className="flex items-center gap-2 text-red-600 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">{nameError}</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-sm">Category</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/90 backdrop-blur-xl">
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Leafy Greens</option>
                      <option>Herbs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-sm">Unit Type</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/90 backdrop-blur-xl">
                      <option>KG</option>
                      <option>Grams</option>
                      <option>Pieces</option>
                      <option>Bundles</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group w-full ${
                      isSubmitting 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 cursor-pointer'
                    } text-white px-6 py-4 rounded-xl font-bold shadow-2xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Registering Item...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Register Item</span>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemRegister;