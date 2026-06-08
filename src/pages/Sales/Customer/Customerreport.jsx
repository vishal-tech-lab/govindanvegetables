import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Eye, FileText, Download, Calendar, Filter, 
  ArrowLeft, Sparkles, UserCheck, BarChart3, TrendingUp,
  X, CheckCircle, AlertCircle, Printer, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import instances from '../../../components/axios';
import { handleEnterNavigation } from '../../../utils/formNavigation';
import ReportPreviewModal from "../../../components/report/ReportPreviewModal";
import ReportLayout from "../../../components/report/ReportLayout";

function Customerreport() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    instances.get("/customer/all")
      .then((res) => {
        const data = res.data || [];
        setCustomers(data);
        setFilteredCustomers(data);
      })
      .catch((error) => {
        console.error("Error loading customers:", error);
        setCustomers([]);
        setFilteredCustomers([]);
      })
      .finally(() => {
        setTimeout(() => setIsLoading(false), 800);
      });
  }, []);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handlePreviewReport = () => {
    setIsReportPreviewOpen(true);
  };

  const prepareTableHeaders = () => {
    return ['S.No', 'Customer Name'];
  };

  const prepareTableRows = () => {
    return customers.map((customer, index) => [
      index + 1,
      customer.customername
    ]);
  };

  const prepareReportData = () => {
    return {
      title: "Customer Report",
      headerData: {
        date: new Date().toLocaleDateString()
      },
      tableHeaders: prepareTableHeaders(),
      tableRows: prepareTableRows(),
      footerData: {
        generatedOn: new Date().toLocaleDateString()
      }
    };
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "S.No,Customer Name\n" +
      customers.map((customer, index) => 
        `${index + 1},"${customer.customername}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
    successDiv.textContent = 'Customer report exported successfully!';
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <FileText className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Generating Report</h2>
          <p className="text-green-600">Please wait...</p>
        </motion.div>
      </div>
    );
  }

  const reportData = prepareReportData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
            >
              <FileText className="w-7 h-7 text-white" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight">
              <span className="text-green-600">Customer Report</span>
            </h1>
          </div>

          <p className="text-slate-600 text-base mb-4">
            Comprehensive customer database overview
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center">
                <div className="bg-white/20 p-2 rounded-xl mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Customer Database ({customers.length} records)
                <Filter className="w-4 h-4 ml-3 text-yellow-300" />
              </h2>

              <button
                onClick={handlePreviewReport}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Report
              </button>
            </div>
          </div>

          <div className="p-6">
            {customers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center"
                >
                  <Users className="w-6 h-6 text-gray-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Customers Found</h3>
                <p className="text-gray-500 text-sm">No customer records available</p>
              </motion.div>
            ) : (
              <div className="overflow-hidden rounded-xl border-2 border-slate-200 shadow-xl">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700 border-b border-slate-300 text-base">
                        S.No
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700 border-b border-slate-300 text-base">
                        Customer Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {customers.map((customer, index) => (
                        <motion.tr
                          key={customer.customerid}
                          custom={index}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          exit={{ opacity: 0, x: -100 }}
                          className={`cursor-pointer transition-colors duration-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                          }`}
                        >
                          <td className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-3 shadow-lg"
                              >
                                <span className="text-white font-bold text-xs">
                                  {index + 1}
                                </span>
                              </motion.div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3 shadow-lg"
                              >
                                <span className="text-white font-bold text-base">
                                  {customer.customername.charAt(0).toUpperCase()}
                                </span>
                              </motion.div>
                              <div>
                                <p className="text-lg font-bold text-slate-800">
                                  {customer.customername}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Active Customer
                                </p>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <ReportPreviewModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        reportRef={reportRef}
        title="Customer Report"
        tableHeaders={reportData.tableHeaders}
        tableRows={reportData.tableRows}
      >
        <ReportLayout
          title={reportData.title}
          headerData={reportData.headerData}
          tableHeaders={reportData.tableHeaders}
          tableRows={reportData.tableRows}
          footerData={reportData.footerData}
        />
      </ReportPreviewModal>

      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Customerreport;