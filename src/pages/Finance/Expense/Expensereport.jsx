import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Eye, 
  DollarSign, 
  Package, 
  Filter,
  X,
  Receipt,
  FileText,
  Tag,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import instances from '../../../components/axios';
import { handleEnterNavigation } from '../../../utils/formNavigation';
import ReportPreviewModal from '../../../components/report/ReportPreviewModal';
import ReportLayout from '../../../components/report/ReportLayout';

function Expensereport() {
  const [expense, setExpense] = useState([]);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [selctedcatogroy, setSelctedcatogroy] = useState("ALL");
  const [filterexpense, setFilterexpense] = useState([]);
  const [expcatogory, setExpcatogory] = useState([]);
  const [openPreview, setopenPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef(null);

  // ✅ Indian Rupee Formatting Function
  const formatIndianCurrency = (amount) => {
    if (amount === 0 || amount === '' || amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // Set default dates (last 7 days)
  useEffect(() => {
    const today = new Date();
    const lastweek = new Date();
    lastweek.setDate(today.getDate() - 7);
    
    const formatForInput = (d) => d.toISOString().split('T')[0];
    setFromdate(formatForInput(lastweek));
    setTodate(formatForInput(today));
  }, []);

  // ✅ INSTANT filtering without fake loading
  useEffect(() => {
    applyFilter();
  }, [fromdate, todate, selctedcatogroy, expense]);

  // Load initial data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      instances.get("/expense/all"),
      instances.get("/expcatgory/all")
    ])
    .then(([expenseRes, categoryRes]) => {
      setExpense(expenseRes.data || []);
      setExpcatogory(categoryRes.data || []);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Cannot fetch data", error);
      setIsLoading(false);
    });
  }, []);

  // ✅ INSTANT filtering function - NO fake loading
  const applyFilter = () => {
    let data = [...expense];
    
    if (fromdate && todate) {
      data = data.filter(item => 
        new Date(item.date) >= new Date(fromdate) &&
        new Date(item.date) <= new Date(todate)
      );
    }

    if (selctedcatogroy && selctedcatogroy !== "ALL") {
      data = data.filter(item => item.category === selctedcatogroy);
    }

    setFilterexpense(data);
  };

  const clearFilters = () => {
    const today = new Date();
    const lastweek = new Date();
    lastweek.setDate(today.getDate() - 7);
    
    const formatForInput = (d) => d.toISOString().split('T')[0];
    setFromdate(formatForInput(lastweek));
    setTodate(formatForInput(today));
    setSelctedcatogroy("ALL");
  };

  // Stats calculations
  const totalExpenses = filterexpense.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalItems = filterexpense.length;
  const uniqueCategories = [...new Set(filterexpense.map(item => item.category))].length;
  const avgExpense = totalItems > 0 ? totalExpenses / totalItems : 0;

  const stats = [
    { 
      title: "Total Expenses", 
      value: `₹${formatIndianCurrency(totalExpenses)}`, 
      icon: <DollarSign className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "+12.5%" 
    },
    { 
      title: "Total Items", 
      value: formatIndianCurrency(totalItems), 
      icon: <Package className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "+8.2%" 
    },
    { 
      title: "Categories", 
      value: formatIndianCurrency(uniqueCategories), 
      icon: <Tag className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "+15.3%" 
    },
    { 
      title: "Average Amount", 
      value: `₹${formatIndianCurrency(avgExpense)}`, 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: "from-green-600 to-emerald-600", 
      change: "Per item" 
    },
  ];

  const headers = ["Date", "Category", "Amount", "Description"];
  const tableRows = filterexpense.map(item => [
    <span className="font-bold">{formatDate(item.date)}</span>,
    <span className="font-bold">{item.category}</span>,
    <span className="font-bold">₹{formatIndianCurrency(item.amount)}</span>,
    <span className="font-bold">{item.description}</span>
  ]);

  // ✅ Show initial loading only
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-slate-600 font-medium text-lg">Loading expense data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
  <FileText className="w-6 h-6 text-white" />
</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight">
              <span className="text-green-600">Expense Report</span>
            </h1>
          </div>
          <p className="text-slate-600 mb-4">Comprehensive expense analysis and reporting</p>
        </motion.div>

       

        {/* Filters Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden mb-6"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_theme(colors.green.500)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
          </div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-md">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Report Filters</h3>
                <p className="text-slate-600 text-sm">Customize your expense report data</p>
              </div>
            </div>

            <button 
              onClick={clearFilters} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Clear Filters</span>
            </button>
          </div>

          {/* Date Range */}
          <div className="mb-6 relative z-10">
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Date Range Selection
            </h4>

            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-600">From Date</label>
                <input
                  type="date"
                  value={fromdate}
                  onChange={e => setFromdate(e.target.value)}
                  className="w-60 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm 
                            focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all 
                            duration-300 text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-600">To Date</label>
                <input
                  type="date"
                  value={todate}
                  onChange={e => setTodate(e.target.value)}
                  className="w-60 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm 
                            focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all 
                            duration-300 text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* ✅ Category Filter with smooth transitions */}
          <div className="relative z-10">
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-500" />
              Category Filter
            </h4>

            <div className="flex flex-wrap gap-3">
              {/* All Categories */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                layout
              >
                <Card
                  onClick={() => setSelctedcatogroy("ALL")}
                  className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
                    selctedcatogroy === "ALL" 
                      ? "border-green-500 bg-green-50 shadow-lg" 
                      : "border-slate-200 bg-white/80 hover:border-green-300"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        animate={{ 
                          backgroundColor: selctedcatogroy === "ALL" ? "#10b981" : "#94a3b8" 
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-3 h-3 rounded-full"
                      ></motion.div>
                      <span className={`font-medium text-sm transition-colors duration-300 ${
                        selctedcatogroy === "ALL" ? "text-green-700" : "text-slate-600"
                      }`}>
                        All Categories ({formatIndianCurrency(expcatogory.length)})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Individual Categories */}
              <AnimatePresence>
                {expcatogory
                  .filter(category => category.expensecategory && category.expensecategory.trim() !== "")
                  .map((category, index) => (
                    <motion.div
                      key={category.expensecategoryid}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => setSelctedcatogroy(category.expensecategory)}
                        className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
                          selctedcatogroy === category.expensecategory 
                            ? "border-teal-500 bg-teal-50 shadow-lg" 
                            : "border-slate-200 bg-white/80 hover:border-teal-300"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <motion.div 
                              animate={{ 
                                backgroundColor: selctedcatogroy === category.expensecategory ? "#14b8a6" : "#94a3b8" 
                              }}
                              transition={{ duration: 0.3 }}
                              className="w-3 h-3 rounded-full"
                            ></motion.div>
                            <span className={`font-medium text-sm transition-colors duration-300 ${
                              selctedcatogroy === category.expensecategory ? "text-teal-700" : "text-slate-600"
                            }`}>
                              {category.expensecategory}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ✅ FIXED TABLE SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.6 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden relative"
        >
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Expense Data (
                <motion.span
                  key={filterexpense.length}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatIndianCurrency(filterexpense.length)}
                </motion.span> records)
              </h3>

              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setopenPreview(true)} 
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Report</span>
              </motion.button>
            </div>
          </div>

          {/* ✅ FIXED TABLE WITH PROPER COLUMN WIDTHS */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-16" /> {/* S.No */}
                <col className="w-28" /> {/* Date */}
                <col className="w-32" /> {/* Category */}
                <col className="w-28" /> {/* Amount */}
                <col /> {/* Description - takes remaining space */}
              </colgroup>
              
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0 }}>
                      S.No
                    </motion.div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                      Date
                    </motion.div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      Category
                    </motion.div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                      Amount
                    </motion.div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                      Description
                    </motion.div>
                  </th>
                </tr>
              </thead>
              
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filterexpense.map((item, i) => (
                    <motion.tr
                      key={`${item.expenseid}-${item.category}`}
                      layout="position"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      className="hover:bg-green-50/50 transition-colors duration-200 border-b border-slate-100"
                    >
                      {/* ✅ S.No - Fixed width */}
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {formatIndianCurrency(i + 1)}
                        </div>
                      </td>
                      
                      {/* ✅ Date - Fixed width */}
                      <td className="px-4 py-3 text-sm text-slate-600 font-bold">
                        {formatDate(item.date)}
                      </td>
                      
                      {/* ✅ Category - Fixed width with truncation */}
                      <td className="px-4 py-3 text-sm text-slate-800 font-bold">
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="truncate" title={item.category}>
                            {item.category}
                          </span>
                        </div>
                      </td>
                      
                      {/* ✅ Amount - Fixed width */}
                      <td className="px-4 py-3 text-sm font-bold">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-black inline-flex items-center text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ₹{formatIndianCurrency(item.amount)}
                        </span>
                      </td>
                      
                      {/* ✅ Description - Flexible width with proper text wrapping */}
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                        <div className="break-words overflow-wrap-anywhere leading-relaxed hyphens-auto" style={{ wordBreak: 'break-word' }}>
                          {item.description}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Empty State */}
            {filterexpense.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.4 }}
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No expense data found</h3>
                <p className="text-slate-500">Try adjusting your filter criteria</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setopenPreview(false)}
        reportRef={reportRef}
        title="Expense Report"
        tableHeaders={headers}
        tableRows={tableRows.map(row => row.map(cell => 
          typeof cell === 'object' && cell.props ? cell.props.children : cell
        ))}
      >
        <ReportLayout 
          title="EXPENSE REPORT"
          headerData={{
            date: new Date().toLocaleDateString('en-IN')
          }}  
          tableHeaders={headers}
          tableRows={tableRows.map(row => row.map(cell => 
            typeof cell === 'object' && cell.props ? cell.props.children : cell
          ))}
          footerData={{ 
            generatedOn: new Date().toLocaleDateString('en-IN'),
            totalExpenses: `₹${formatIndianCurrency(totalExpenses)}`,
            totalItems: formatIndianCurrency(totalItems)
          }}
        />
      </ReportPreviewModal>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-16 h-16 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-12 h-12 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-10 h-10 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Expensereport;
