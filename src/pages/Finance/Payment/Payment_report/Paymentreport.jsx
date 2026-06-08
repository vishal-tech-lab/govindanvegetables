import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import insatnces from "../../../../components/axios";
import { format } from "date-fns";
import ReportPreviewModal from "../../../../components/report/ReportPreviewModal";
import ReportLayout from "../../../../components/report/ReportLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Eye, Filter, Search, X, Receipt } from "lucide-react";
import Customerdropdown from "../../../../components/Customerdropdown";
import { handleEnterNavigation } from "../../../../utils/formNavigation";

function PaymentReport() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    fromdate: "",
    todate: "",
    customer: "",
  });

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const reportRef = useRef(null);

  const toISODateLocal = (d) => format(d, "yyyy-MM-dd");

  useEffect(() => {
    insatnces
      .get("/customer/all")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setCustomers(arr);
        setFilteredCustomers(arr);
      })
      .catch((err) => console.error(err));
  }, []);

  useLayoutEffect(() => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      setFilteredCustomers(
        customers.filter((c) => c.customername?.toLowerCase().includes(q))
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);
useEffect(() => {
  const todayStr = new Date().toISOString().split('T')[0]; // Gets '2026-04-16'

  setFilters({
    fromdate: todayStr,
    todate: todayStr,
    customer: "",
  });
}, []);
  useEffect(() => {
  // Don't fetch if dates are missing
  if (!filters.fromdate || !filters.todate) return;

  const controller = new AbortController();
  setIsLoading(true);
  setShowSpinner(true);

  // LOG THE FILTERS to make sure they are actually changing
  console.log("Fetching payments for:", filters);

  // Construct URL correctly
  let url = `payment/payments?from=${filters.fromdate}&to=${filters.todate}`;
  
  // Important: Use the customer name from filters
  if (filters.customer && filters.customer.trim() !== "") {
    url += `&customername=${encodeURIComponent(filters.customer.trim())}`;
  }

  insatnces
    .get(url, { signal: controller.signal })
    .then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Data received:", data.length, "records");
      
      // Update the state that the table is mapping over
      setPayments(data);
      setFilteredPayments(data); 
    })
    .catch((err) => {
      if (err?.name !== "CanceledError") {
        console.error("Fetch error:", err);
      }
    })
    .finally(() => {
      setIsLoading(false);
      setShowSpinner(false);
    });

  return () => controller.abort();
}, [filters.fromdate, filters.todate, filters.customer]); // <--- MUST have all three here

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    const today = new Date();
    const todayStr = toISODateLocal(today);

    setFilters({
      fromdate: todayStr,
      todate: todayStr,
      customer: "",
    });

    setSearchTerm("");
    setSelectedCustomer(null);
  };

  const totalPayment = filteredPayments.reduce(
    (sum, item) => sum + parseFloat(item.customerpayment || 0),
    0
  );

  const tableHeaders = ["Date", "Customer Name", "Payment"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3">
      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-2"
        >
          <h1 className="text-2xl font-black text-slate-800">
            <span className="text-green-600">Payment Report</span>
          </h1>
          <p className="text-slate-500 text-xs">Customer payment records</p>
        </motion.div>

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
              <X className="w-3 h-3" />
              Reset
            </button>
          </div>

          <form onKeyDown={handleEnterNavigation}>
          <div className="px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date Range
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium">From</span>
                  <input
                    type="date"
                    name="fromdate"
                    value={filters.fromdate}
                    onChange={handleInput}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">To</span>
                  <input
                    type="date"
                    name="todate"
                    value={filters.todate}
                    onChange={handleInput}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all mt-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Users className="w-3 h-3" /> Customer
              </label>

              <Customerdropdown
                selectedCustomer={selectedCustomer}
                onCustomerSelect={(customer) => {
                  setSelectedCustomer(customer);
                  setFilters((prev) => ({
                    ...prev,
                    customer: customer.customername,
                  }));
                }}
              />

              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, customer: "" }));
                  setSelectedCustomer(null);
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  !filters.customer
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                All Customers
              </button>
            </div>
          </div>

          {showSpinner && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-slate-600 font-medium text-sm">Updating...</span>
              </div>
            </div>
          )}
          </form>
        </motion.div>

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
                Payment Data ({filteredPayments.length} records)
              </h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenPreview(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Report
            </motion.button>
          </div>

          {showSpinner && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-slate-600 text-sm">Loading payment data...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto" ref={reportRef}>
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment.paymentid}
                    layout="position"
                    initial={false}
                    className="hover:bg-green-50/50 transition-colors duration-150 border-b border-slate-100"
                  >
                    <td className="px-3 py-2 text-slate-600">
                      {payment.date ? format(new Date(payment.date), "dd-MM-yyyy") : ""}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {payment.customername}
                    </td>
                    <td className="px-3 py-2 font-bold text-green-700">
                      ₹{parseFloat(payment.customerpayment ?? 0).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && !isLoading && !showSpinner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 text-center"
              >
                <h3 className="text-base font-semibold text-slate-600 mb-1">
                  No payment records found
                </h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your filter criteria
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        reportRef={reportRef}
        title="Customer Payment Report"
      >
        <ReportLayout
          title="Customer Payment Report"
          headerData={{}}
          tableHeaders={tableHeaders}
          tableRows={filteredPayments.map((payment) => [
            payment.date ? format(new Date(payment.date), "dd-MM-yyyy") : "",
            payment.customername,
            `₹${parseFloat(payment.customerpayment ?? 0).toLocaleString()}`,
          ])}
          footerData={{ generatedOn: new Date().toLocaleDateString() }}
        />
      </ReportPreviewModal>
    </div>
  );
}

export default PaymentReport;