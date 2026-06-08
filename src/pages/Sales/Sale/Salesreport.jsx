import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import insatnces from "../../../components/axios";
import { format } from "date-fns";
import ReportPreviewModal from "../../../components/report/ReportPreviewModal";
import ReportLayout from "../../../components/report/ReportLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Eye, Receipt, Leaf, Hash, Filter, Search, X,
} from "lucide-react";
import { handleEnterNavigation } from "../../../utils/formNavigation";

function Salesreport() {
  const [Allsales, setAllsales] = useState([]);
  const [Filtersales, setFiltersales] = useState([]);
  const [Filters, setFilters] = useState({ fromdate: "", todate: "", customer: "", billno: "" });
  const reportRef = useRef(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const toISODateLocal = (d) => format(d, "yyyy-MM-dd");

  useEffect(() => {
    insatnces.get("/customer/all")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setCustomers(arr);
        setFilteredCustomers(arr);
      })
      .catch((err) => console.error(err));
  }, []);

  useLayoutEffect(() => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      setFilteredCustomers(customers.filter((c) => c.customername?.toLowerCase().startsWith(q)));
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    const today = new Date();
    const lastweek = new Date();
    lastweek.setDate(today.getDate() - 7);
    setFilters((prev) => ({
      ...prev,
      fromdate: toISODateLocal(lastweek),
      todate: toISODateLocal(today),
    }));
  }, []);

  useEffect(() => {
    if (!Filters.fromdate || !Filters.todate) return;
    const controller = new AbortController();
    setIsLoading(true);
    const timer = setTimeout(() => setShowSpinner(true), 300);

    let url = `sales/report?from=${Filters.fromdate}&to=${Filters.todate}`;
    if (Filters.customer) url += `&customername=${encodeURIComponent(Filters.customer)}`;

    insatnces.get(url, { signal: controller.signal })
      .then((res) => setAllsales(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError")
          console.error("Cannot fetch sales", err);
      })
      .finally(() => {
        setIsLoading(false);
        clearTimeout(timer);
        setShowSpinner(false);
      });

    return () => { controller.abort(); clearTimeout(timer); setShowSpinner(false); };
  }, [Filters.customer, Filters.todate, Filters.fromdate]);

  useEffect(() => {
    if (Filters.billno) {
      setFiltersales(Allsales.filter((s) => s.billno === Filters.billno));
    } else {
      setFiltersales(Allsales);
    }
  }, [Filters.billno, Allsales]);

  const handleinput = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, billno: "" }));
  };

  const clearFilters = () => {
    const today = new Date();
    const lastweek = new Date();
    lastweek.setDate(today.getDate() - 7);
    setFilters({ fromdate: toISODateLocal(lastweek), todate: toISODateLocal(today), customer: "", billno: "" });
    setSearchTerm("");
  };

  const uniquebillno = [...new Set(Allsales.map((s) => s.billno))];

  const tableHeaders = ["S.No", "Bill No", "Date", "Customer", "Item", "Price", "Bag", "Weight", "Total"];

  // ✅ Plain strings only — NO JSX, NO Tamil text, no wrapping issues
  const tableRows = Filtersales.map((sale, index) => [
    String(index + 1),
    `#${sale.billno}`,
    sale.date ? format(new Date(sale.date), "dd-MM-yyyy") : "",
    sale.customername || "",
    sale.itemname || "",
    `Rs.${parseFloat(sale.itemprice ?? 0).toLocaleString('en-IN')}`,
    String(sale.bag ?? ""),
    `${sale.weight ?? ""}kg`,
    `Rs.${parseFloat(sale.total ?? 0).toLocaleString('en-IN')}`,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3">
      <div className="relative z-10 max-w-7xl mx-auto space-y-3">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-2"
        >
          <h1 className="text-2xl font-black text-slate-800">
            <span className="text-green-600">Sales Report</span>
          </h1>
          <p className="text-slate-500 text-xs">Fresh • Organic • Premium Quality</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md relative overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg mr-2">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Report Filters</h2>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all text-xs font-semibold"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onKeyDown={handleEnterNavigation}>
          <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Date Range
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium">From</span>
                  <input type="date" name="fromdate" value={Filters.fromdate} onChange={handleinput}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all mt-0.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">To</span>
                  <input type="date" name="todate" value={Filters.todate} onChange={handleinput}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all mt-0.5" />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                <Users className="w-3 h-3 mr-1" /> Customer
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                <div
                  onClick={() => setFilters((prev) => ({ ...prev, customer: "", billno: "" }))}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all border ${
                    !Filters.customer ? "bg-green-100 border-green-300 text-green-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50"
                  }`}
                >All Customers</div>
                <AnimatePresence initial={false}>
                  {filteredCustomers.map((customer, index) => (
                    <motion.div key={customer.customerid}
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setFilters((prev) => ({ ...prev, customer: customer.customername, billno: "" }))}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all border ${
                        Filters.customer === customer.customername ? "bg-green-100 border-green-300 text-green-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >{customer.customername}</motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Bill Number */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                <Hash className="w-3 h-3 mr-1" /> Bill Number
              </label>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                <div
                  onClick={() => setFilters((prev) => ({ ...prev, billno: "" }))}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all border ${
                    !Filters.billno ? "bg-green-100 border-green-300 text-green-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50"
                  }`}
                >All Bills ({uniquebillno.length})</div>
                {uniquebillno.map((value, index) => (
                  <motion.div key={value}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setFilters((prev) => ({ ...prev, billno: value }))}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all border ${
                      Filters.billno === value ? "bg-teal-100 border-teal-300 text-teal-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                    }`}
                  >#{value}</motion.div>
                ))}
              </div>
            </div>
          </div>
          </form>

          {showSpinner && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-slate-600 font-medium text-sm">Updating...</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md relative overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg mr-2">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Sales Data ({Filtersales.length} records)
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenPreview(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-md"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Report
            </motion.button>
          </div>

          {showSpinner && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-slate-600 text-sm">Loading sales data...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Filtersales.map((sale, index) => (
                  <motion.tr key={sale.salesid} layout="position" initial={false}
                    className="hover:bg-green-50/50 transition-colors duration-150 border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-500 text-xs">{index + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">#{sale.billno}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {sale.date ? format(new Date(sale.date), "dd-MM-yyyy") : ""}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{sale.customername}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {sale.itemname}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">
                      ₹{parseFloat(sale.itemprice ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{sale.bag}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{sale.weight}kg</td>
                    <td className="px-3 py-2 font-bold text-green-700 whitespace-nowrap">
                      ₹{parseFloat(sale.total ?? 0).toLocaleString('en-IN')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {Filtersales.length === 0 && !isLoading && !showSpinner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center">
                <div className="text-4xl mb-3">🥬</div>
                <h3 className="text-base font-semibold text-slate-600 mb-1">No vegetable sales found</h3>
                <p className="text-xs text-slate-500">Try adjusting your filter criteria</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        reportRef={reportRef}
        title="Vegetable Sales Report"
        tableHeaders={tableHeaders}
        tableRows={tableRows}
      >
        <ReportLayout
          title="VEGETABLE SALES REPORT"
          headerData={{}}
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          footerData={{ generatedOn: new Date().toLocaleDateString("en-IN") }}
        />
      </ReportPreviewModal>
    </div>
  );
}

export default Salesreport;