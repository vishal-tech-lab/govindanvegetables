import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Customerdropdown from "../../../components/Customerdropdown";
import Itemdropdown from "../../../components/Itemdropdown";
import instances from "../../../components/axios";
import ConfirmModal from "./Salesregister/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import useDashboardData from "../../../components/DashboardWidget";
import { handleEnterNavigation } from "../../../utils/formNavigation";
import {
  FileText, User, Package, DollarSign, Weight,
  Plus, Edit3, Trash2, Save, CheckCircle, Calculator,
  Receipt, AlertCircle
} from 'lucide-react';

function Salesregister() {
  const navigate = useNavigate();

  const [salesdata, setSalesdata] = useState({
    billno: "", date: "", customername: "", customerid: "", itemname: "",
    itemprice: "", weight: "", bag: "", total: "", editIndex: undefined,
  });
  const [items, setItems] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const billNo = Math.floor(100000 + Math.random() * 900000);
    setSalesdata(prev => ({ ...prev, date: dateStr, billno: billNo }));
  }, []);

  useEffect(() => {
    const weight = parseFloat(salesdata.weight) || 0;
    const bag = parseFloat(salesdata.bag) || 0;
    const price = parseFloat(salesdata.itemprice) || 0;
    const total = (weight || bag) * price;
    setSalesdata(prev => ({ ...prev, total }));
  }, [salesdata.weight, salesdata.bag, salesdata.itemprice]);

  const fields = useMemo(() => ["totalbalance"], []);
  const { data, loading } = useDashboardData(salesdata.customername, salesdata.date, fields);

  const formatINRLive = useCallback((value) => {
    if (value == null || value === "") return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  const validateItem = useCallback(() => {
    const newErrors = {};
    if (!salesdata.itemname) newErrors.itemname = "Item name is required";
    if (!salesdata.itemprice || parseFloat(salesdata.itemprice) <= 0)
      newErrors.itemprice = "Valid price is required";
    if ((!salesdata.weight || parseFloat(salesdata.weight) <= 0) &&
        (!salesdata.bag || parseFloat(salesdata.bag) <= 0))
      newErrors.quantity = "Either weight or bag quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [salesdata]);

  const handleAdd = useCallback(() => {
    if (!validateItem()) return;
    const finalWeight = salesdata.weight || salesdata.bag;
    const newItem = {
      itemname: salesdata.itemname,
      itemprice: salesdata.itemprice,
      weight: finalWeight,
      bag: salesdata.bag ? parseFloat(salesdata.bag) : 1,
      total: salesdata.total,
    };
    if (salesdata.editIndex !== undefined) {
      setItems(prev => { const n = [...prev]; n[salesdata.editIndex] = newItem; return n; });
    } else {
      setItems(prev => [...prev, newItem]);
    }
    setSalesdata(prev => ({
      ...prev, itemname: "", itemprice: "", bag: "", weight: "", total: "", editIndex: undefined
    }));
    setErrors({});
  }, [validateItem, salesdata]);

  const handleEdit = useCallback((index) => {
    const item = items[index];
    setSalesdata(prev => ({ ...prev, ...item, editIndex: index }));
  }, [items]);

  const handleDeleteClick = useCallback((index) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setItems(prev => prev.filter((_, index) => index !== deleteIndex));
    setShowDeleteConfirm(false);
    setDeleteIndex(undefined);
  }, [deleteIndex]);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (items.length === 0) { setErrors({ submit: "Please add at least one item before submitting" }); return; }
    setIsSubmitting(true);
    setErrors({});
    try {
      await instances.post("sales/register", {
        billno: salesdata.billno,
        date: salesdata.date,
        customername: salesdata.customername,
        items: items,
      });
      const newBillNo = Math.floor(100000 + Math.random() * 900000);
      setSalesdata({
        billno: newBillNo, date: salesdata.date, customername: "", customerid: "",
        itemname: "", itemprice: "", weight: "", bag: "", total: "", editIndex: undefined,
      });
      setItems([]);
      setCustomerSearch("");
      setErrors({ success: "Sales registered successfully!" });
    } catch (error) {
      setErrors({ submit: "Failed to register sales. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [items, salesdata]);

  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0), [items]);

  const customerBalance = useMemo(() =>
    parseFloat(data?.totalbalance || 0), [data?.totalbalance]);

  const grandTotal = useMemo(() =>
    subtotal + customerBalance, [subtotal, customerBalance]);

  const updateField = useCallback((field, value) => {
    setSalesdata(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fbf8] p-3 md:p-4">
      <div className="max-w-[1800px] mx-auto">

        {/* Page heading — centered, bill info top-right */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 relative flex flex-col items-center"
        >
          <h1 className="text-xl md:text-2xl font-bold text-green-700 text-center">Sales Registration</h1>
          <p className="text-xs text-slate-500 mt-0.5 text-center">Fresh • Organic • Premium Quality</p>
          {/* Bill info top-right */}
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-green-100 rounded-md shadow-sm px-3 py-1.5">
              <FileText className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="text-[11px] font-bold text-green-800">#{salesdata.billno}</span>
            </div>
            <input
              type="date"
              value={salesdata.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="h-8 px-2 rounded-md border border-green-100 bg-white shadow-sm text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
          </div>
        </motion.div>

        <form onKeyDown={handleEnterNavigation} onSubmit={submit} className="space-y-4">

          {/* ── Top row: Customer (left) | Add Fresh Items (right) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">

            {/* Col 1 — Select Customer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white border border-green-100 rounded-md shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-green-100">
                <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-[12px] font-bold text-slate-800">Select Customer</h2>
              </div>
              <div className="px-2.5 py-2">
                <Customerdropdown
                  selectedCustomer={
                    salesdata.customername
                      ? { customerid: salesdata.customerid, customername: salesdata.customername }
                      : null
                  }
                  onCustomerSelect={(customer) => {
                    setSalesdata(prev => ({
                      ...prev,
                      customerid: customer?.customerid || "",
                      customername: customer?.customername || "",
                    }));
                  }}
                  className="w-full"
                />
                {salesdata.customername && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Balance</p>
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-green-800">
                          ₹{formatINRLive(data?.totalbalance || 0)}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          data?.totalbalance > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {data?.totalbalance > 0 ? "Active" : "Pending"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Col 2 — Add Fresh Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white border border-green-100 rounded-md shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-green-100">
                <div className="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-[13px] font-bold text-slate-800">Add Fresh Items</h2>
              </div>

              <div className="p-4">
                {Object.keys(errors).length > 0 && !errors.success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2"
                  >
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <ul className="text-xs text-red-700 font-medium space-y-0.5">
                        {Object.values(errors)
                          .filter((e) => e !== errors.success)
                          .map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {errors.success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-800">{errors.success}</p>
                  </motion.div>
                )}

                {/* Two-column layout: item list LEFT, inputs RIGHT — exactly like the image */}
                <div className="flex gap-6">

                  {/* LEFT — Search & Select Item */}
                  <div className="w-[45%] shrink-0">
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      Search & Select Item
                    </label>
                    <Itemdropdown
                      value={salesdata.itemname}
                      onSelect={(item) => {
                        setSalesdata((prev) => ({
                          ...prev,
                          itemname: item.itemname,
                          itemprice: item.itemprice || "",
                        }));
                      }}
                      displayType="filtered-list"
                    />
                  </div>

                  {/* RIGHT — Price, Bags, Weight, Total + Add */}
                  <div className="flex-1 space-y-3">
                    {/* Price */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        Price
                      </label>
                      <input
                        type="text"
                        value={formatINRLive(salesdata.itemprice)}
                        onChange={(e) => updateField("itemprice", e.target.value.replace(/,/g, ""))}
                        placeholder="0.00"
                        className={`w-full h-10 px-3 rounded-md border bg-white text-sm font-medium focus:outline-none focus:ring-2 ${
                          errors.itemprice
                            ? "border-red-300 focus:ring-red-200"
                            : "border-slate-200 focus:ring-green-200 focus:border-green-400"
                        }`}
                      />
                    </div>

                    {/* Bags + Weight side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          Bags/Units
                        </label>
                        <input
                          type="text"
                          value={formatINRLive(salesdata.bag)}
                          onChange={(e) => updateField("bag", e.target.value.replace(/,/g, ""))}
                          placeholder="0"
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                          <Weight className="w-3.5 h-3.5" />
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          value={formatINRLive(salesdata.weight)}
                          onChange={(e) => updateField("weight", e.target.value.replace(/,/g, ""))}
                          placeholder="0.0"
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </div>

                    {/* Total + Add button */}
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 h-10 px-3 rounded-md border border-green-200 bg-green-50 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-800 flex items-center gap-1">
                          <Calculator className="w-4 h-4" />
                          Total
                        </span>
                        <span className="text-base font-bold text-green-900">
                          ₹{formatINRLive(salesdata.total)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAdd}
                        className="h-10 px-5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-sm transition inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        {salesdata.editIndex !== undefined ? "Update" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Cart — full width below ── */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="bg-white border border-green-100 rounded-md shadow-sm"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-green-100">
                <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-800">
                  Cart ({items.length} items)
                </h2>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["#", "Item", "Price", "Bags", "Weight", "Total", "Actions"].map((h) => (
                          <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-600">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {items.map((item, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="border-b border-slate-100"
                          >
                            <td className="px-3 py-3 font-semibold text-slate-700">{index + 1}</td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{item.itemname}</td>
                            <td className="px-3 py-3 font-semibold text-green-700">₹{formatINRLive(item.itemprice)}</td>
                            <td className="px-3 py-3 text-slate-700">{formatINRLive(item.bag)}</td>
                            <td className="px-3 py-3 text-slate-700">{formatINRLive(item.weight)} kg</td>
                            <td className="px-3 py-3 font-semibold text-slate-900">₹{formatINRLive(item.total)}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(index)}
                                  className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(index)}
                                  className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>

                      <tr>
                        <td colSpan="5" className="px-3 py-3 text-right text-sm font-semibold text-slate-700">Subtotal:</td>
                        <td className="px-3 py-3 text-sm font-bold text-slate-900">₹{formatINRLive(subtotal.toFixed(2))}</td>
                        <td />
                      </tr>

                      {salesdata.customername && (
                        <tr>
                          <td colSpan="5" className="px-3 py-3 text-right text-sm font-semibold text-green-700">Customer Balance:</td>
                          <td className="px-3 py-3 text-sm font-bold text-green-800">₹{formatINRLive(customerBalance.toFixed(2))}</td>
                          <td />
                        </tr>
                      )}

                      {salesdata.customername && (
                        <tr className="border-t border-slate-200">
                          <td colSpan="5" className="px-3 py-3 text-right text-base font-bold text-slate-800">Grand Total:</td>
                          <td className="px-3 py-3 text-base font-bold text-green-700">₹{formatINRLive(grandTotal.toFixed(2))}</td>
                          <td />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={items.length === 0 || isSubmitting}
                    className={`h-12 px-8 rounded-full text-sm font-bold transition shadow-sm ${
                      items.length === 0 || isSubmitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Submit Sales
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </form>

        {showDeleteConfirm && (
          <ConfirmModal
            message="Are you sure you want to delete this item?"
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeleteIndex(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Salesregister;