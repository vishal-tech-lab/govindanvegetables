import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  AlertTriangle,
  Receipt,
  Banknote,
  CheckCircle,
  Tag,
  Settings,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import instances from '../../../components/axios';
import { handleEnterNavigation } from '../../../utils/formNavigation';

function Expenseregister() {
  const [expense, setExpense] = useState({
    date: "",
    category: "",
    amount: "",
    description: ""
  });

  const [allexpense, setAllexpense] = useState([]);
  const [editindex, setEditindex] = useState(null);
  const [deleteindex, setDleteindex] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);

  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editCatIndex, setEditCatIndex] = useState(null);
  const [deleteCatIndex, setDeleteCatIndex] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: ""
  });

  const [expcatogory, setExpcatogory] = useState([]);

  const showPopup = (type, title, message) => {
    setPopup({
      open: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, open: false }));
  };

  const loadCategories = async () => {
    try {
      const res = await instances.get("/expcatgory/all");
      setExpcatogory(res.data || []);
    } catch (error) {
      console.error("Failed to load categories", error);
      showPopup("error", "Category Load Failed", "Unable to fetch expense categories.");
    }
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setExpense(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));

    loadCategories();
  }, []);

  const formatIndianCurrency = (amount) => {
    if (amount === 0 || amount === '' || amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAmountChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setExpense(prev => ({ ...prev, amount: numericValue }));
  };

  const handleChange = (field, value) => {
    setExpense(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (!expense.category || !expense.amount || !expense.description) {
      showPopup("warning", "Missing Fields", "Please fill all fields before adding the expense.");
      return;
    }

    if (editindex !== null) {
      setAllexpense(prev =>
        prev.map((item, index) => index === editindex ? { ...expense } : item)
      );
      setEditindex(null);
    } else {
      setAllexpense(prev => [...prev, { ...expense }]);
    }

    setExpense(prev => ({
      ...prev,
      category: "",
      amount: "",
      description: ""
    }));
  };

  const handleEdit = (i) => {
    setExpense({ ...allexpense[i] });
    setEditindex(i);
  };

  const handledelete = (index) => {
    setAllexpense(prev => prev.filter((_, i) => i !== index));
    setDleteindex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (allexpense.length === 0) {
      showPopup("warning", "No Expenses", "Please add at least one expense before submitting.");
      return;
    }

    setShowSpinner(true);
    try {
      await Promise.all(
        allexpense.map(exp => instances.post("/expense/register", exp))
      );

      setExpense(prev => ({
        date: prev.date,
        category: "",
        amount: "",
        description: ""
      }));
      setAllexpense([]);
      setEditindex(null);

      showPopup("success", "Saved Successfully", "All expense entries have been submitted successfully.");
    } catch (error) {
      console.error(error);
      showPopup("error", "Submission Failed", "Something went wrong while saving expenses.");
    } finally {
      setShowSpinner(false);
    }
  };

  const handleAddCategory = async () => {
    const val = newCatName.trim();
    if (!val) return;

    const exists = expcatogory.some(
      (cat, index) =>
        cat.expensecategory?.toLowerCase() === val.toLowerCase() &&
        index !== editCatIndex
    );

    if (exists) {
      showPopup("warning", "Duplicate Category", "This category already exists in the list.");
      return;
    }

    setCategoryLoading(true);

    try {
      if (editCatIndex !== null) {
        const currentCat = expcatogory[editCatIndex];
        const oldCategory = currentCat?.expensecategory;

        await instances.put(`/expcatgory/update/${currentCat.expensecategoryid}`, {
          ...currentCat,
          expensecategory: val
        });

        setExpcatogory(prev =>
          prev.map((cat, index) =>
            index === editCatIndex
              ? { ...cat, expensecategory: val }
              : cat
          )
        );

        if (expense.category === oldCategory) {
          setExpense(prev => ({ ...prev, category: val }));
        }

        setAllexpense(prev =>
          prev.map(item =>
            item.category === oldCategory
              ? { ...item, category: val }
              : item
          )
        );

        setEditCatIndex(null);
        setNewCatName("");
        showPopup("success", "Category Updated", "Category updated successfully.");
      } else {
        const res = await instances.post("/expcatgory/register", {
          expensecategory: val
        });

        await loadCategories();
        setNewCatName("");

        
      }
    } catch (error) {
      console.error("Category save failed", error);
      showPopup("error", "Category Save Failed", "Unable to save the category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (index) => {
    const cat = expcatogory[index];
    if (!cat) return;

    try {
      setCategoryLoading(true);

      await instances.delete(`/expcatgory/delete/${cat.expensecategoryid}`);

      const deletedCategoryName = cat.expensecategory;

      setExpcatogory(prev => prev.filter((_, i) => i !== index));
      setDeleteCatIndex(null);

      if (expense.category === deletedCategoryName) {
        setExpense(prev => ({ ...prev, category: "" }));
      }

      setAllexpense(prev =>
        prev.filter(item => item.category !== deletedCategoryName)
      );

    } catch (error) {
      console.error("Category delete failed", error);
      showPopup("error", "Delete Failed", "Unable to delete the category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const cancelCatEdit = () => {
    setEditCatIndex(null);
    setNewCatName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3 md:p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div
        className="fixed top-20 left-10 w-16 h-16 bg-green-500/20 rounded-full opacity-60 animate-bounce pointer-events-none"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="fixed top-40 right-10 w-12 h-12 bg-emerald-500/20 rounded-full opacity-60 animate-bounce pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed bottom-20 left-20 w-10 h-10 bg-teal-500/20 rounded-full opacity-60 animate-bounce pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-1 pb-1"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <Receipt className="w-4 h-4 text-white" />
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-800 leading-tight">
              <span className="text-green-600">Expense Register</span>
            </h1>
          </div>

          <p className="text-slate-600 text-xs md:text-sm">
            Track and manage your business expenses efficiently
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-4 md:p-5 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 rounded-xl shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Add New Expense</h3>
              <p className="text-slate-600 text-xs md:text-sm">Enter expense details below</p>
            </div>
          </div>

          <form onKeyDown={handleEnterNavigation}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-green-500" />
                Date
              </label>
              <input
                type="date"
                value={expense.date}
                onChange={e => handleChange("date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white/90 focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all text-sm text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-green-500" />
                Category
              </label>
              <input
                type="text"
                value={expense.category}
                readOnly
                placeholder="Select below"
                className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">₹</span>
                <input
                  type="text"
                  placeholder="0"
                  value={expense.amount ? formatIndianCurrency(expense.amount) : ''}
                  onChange={e => handleAmountChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white/90 focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all text-sm text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-500" />
                Description
              </label>
              <input
                type="text"
                placeholder="Enter description"
                value={expense.description}
                onChange={e => handleChange("description", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white/90 focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all text-sm text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="mb-5 bg-white/60 border border-slate-200 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors duration-200"
              onClick={() => setCatManagerOpen(prev => !prev)}
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Manage Categories</span>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  {expcatogory.filter(c => c.expensecategory?.trim()).length}
                </span>
              </div>

              <motion.div
                animate={{ rotate: catManagerOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-slate-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.div>
            </div>

            <AnimatePresence initial={false}>
              {catManagerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 mb-3">
                      <input
                        type="text"
                        placeholder={editCatIndex !== null ? "Edit category..." : "New category..."}
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                        className="flex-1 px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none text-sm text-slate-700 font-medium"
                      />

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAddCategory}
                        disabled={!newCatName.trim() || categoryLoading}
                        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {editCatIndex !== null ? <><Save className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add</>}
                      </motion.button>

                      {editCatIndex !== null && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={cancelCatEdit}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </motion.button>
                      )}
                    </div>

                    {expcatogory.filter(c => c.expensecategory?.trim()).length === 0 ? (
                      <div className="text-center py-5 text-slate-400 text-sm">
                        No categories yet. Add one above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {expcatogory
                          .filter(cat => cat.expensecategory?.trim())
                          .map((cat, index) => (
                            <motion.div
                              key={cat.expensecategoryid}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                                editCatIndex === index
                                  ? "border-green-400 bg-green-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-green-200 hover:bg-green-50/30"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${editCatIndex === index ? "bg-green-500" : "bg-slate-300"}`}></div>
                                <span className={`text-sm font-semibold truncate ${editCatIndex === index ? "text-green-700" : "text-slate-700"}`}>
                                  {cat.expensecategory}
                                </span>
                              </div>

                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditCatIndex(index);
                                    setNewCatName(cat.expensecategory);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteCatIndex(index)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-5">
            <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center">
              <Tag className="w-4 h-4 text-green-500 mr-2" />
              Select Category
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <AnimatePresence>
                {expcatogory
                  .filter(cat => cat.expensecategory && cat.expensecategory.trim() !== "")
                  .map((cat, index) => (
                    <motion.div
                      key={cat.expensecategoryid}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => handleChange("category", cat.expensecategory)}
                        className={`cursor-pointer transition-all duration-200 border ${
                          expense.category === cat.expensecategory
                            ? "border-green-400 bg-green-50 shadow-sm"
                            : "border-slate-200 bg-white/80 hover:border-green-300"
                        }`}
                      >
                        <CardContent className="p-3 text-center">
                          <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${
                            expense.category === cat.expensecategory ? "bg-green-500" : "bg-slate-300"
                          }`}></div>

                          <span className={`font-semibold text-sm ${
                            expense.category === cat.expensecategory ? "text-green-700" : "text-slate-700"
                          }`}>
                            {cat.expensecategory}
                          </span>

                          {expense.category === cat.expensecategory && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mt-1.5"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300 flex items-center space-x-2 text-sm"
            >
              {editindex !== null ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editindex !== null ? "Update Expense" : "Add Expense"}</span>
            </motion.button>
          </div>
          </form>
        </motion.div>

        {allexpense.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Expense Entries ({formatIndianCurrency(allexpense.length)} items)
                <Banknote className="w-4 h-4 ml-2" />
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    {['S.No', 'Date', 'Category', 'Amount', 'Description', 'Actions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {allexpense.map((exp, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="hover:bg-green-50/50 transition-colors duration-200 border-b border-slate-100"
                      >
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                          <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 font-semibold">
                          {exp.date.split("-").reverse().join("-")}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 font-semibold">
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 text-green-500 mr-2" />
                            {exp.category}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-bold inline-flex items-center">
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            ₹{formatIndianCurrency(exp.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium max-w-xs truncate">
                          {exp.description}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(i)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDleteindex(i)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={showSpinner}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {showSpinner ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Submit All Expenses</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {allexpense.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 text-center shadow-lg"
          >
            <div className="text-5xl mb-3">💸</div>
            <h3 className="text-lg font-semibold text-slate-600 mb-1">No expenses added yet</h3>
            <p className="text-slate-500 text-sm">Add your first expense using the form above</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {deleteindex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Expense</h3>
                <p className="text-slate-600 mb-5 text-sm">
                  Are you sure you want to delete this expense entry?
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => handledelete(deleteindex)}
                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </button>
                  <button
                    onClick={() => setDleteindex(null)}
                    className="px-5 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteCatIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Category</h3>
                <p className="text-slate-600 mb-1 text-sm">Are you sure you want to delete</p>
                <p className="text-green-700 font-bold text-base mb-4">
                  "{expcatogory[deleteCatIndex]?.expensecategory}"?
                </p>
                <p className="text-slate-500 text-sm mb-5">
                  This removes the category from the database.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => handleDeleteCategory(deleteCatIndex)}
                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </button>
                  <button
                    onClick={() => setDeleteCatIndex(null)}
                    className="px-5 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popup.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={closePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-white/70 overflow-hidden"
            >
              <div
                className={`px-6 pt-6 pb-4 text-center ${
                  popup.type === "success"
                    ? "bg-gradient-to-br from-green-50 to-emerald-100"
                    : popup.type === "error"
                    ? "bg-gradient-to-br from-red-50 to-rose-100"
                    : popup.type === "warning"
                    ? "bg-gradient-to-br from-yellow-50 to-amber-100"
                    : "bg-gradient-to-br from-blue-50 to-cyan-100"
                }`}
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-md ${
                    popup.type === "success"
                      ? "bg-green-500"
                      : popup.type === "error"
                      ? "bg-red-500"
                      : popup.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                >
                  {popup.type === "success" && <CheckCircle className="w-8 h-8 text-white" />}
                  {popup.type === "error" && <X className="w-8 h-8 text-white" />}
                  {popup.type === "warning" && <AlertTriangle className="w-8 h-8 text-white" />}
                  {popup.type === "info" && <FileText className="w-8 h-8 text-white" />}
                </motion.div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  {popup.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                  {popup.message}
                </p>
              </div>

              <div className="px-6 py-5 flex justify-center bg-white">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={closePopup}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md ${
                    popup.type === "success"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : popup.type === "error"
                      ? "bg-gradient-to-r from-red-500 to-rose-500"
                      : popup.type === "warning"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Expenseregister;