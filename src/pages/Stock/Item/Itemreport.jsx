import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Eye,
  FileText,
  Database,
  BarChart3,
  Search,
  Filter,
  Download,
  Warehouse,
  Box,
  Boxes
} from 'lucide-react';
import instances from '../../../components/axios';
import { handleEnterNavigation } from '../../../utils/formNavigation';
import ReportPreviewModal from '../../../components/report/ReportPreviewModal';
import ReportLayout from '../../../components/report/ReportLayout';

function Itemreport() {
  const [totalItems, setTotalItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false);
  const reportRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  // ✅ Tamil alphabetical sorting function
  const sortTamilAlphabetically = (items) => {
    return [...items].sort((a, b) => {
      const nameA = a.itemname.toLowerCase();
      const nameB = b.itemname.toLowerCase();
      return nameA.localeCompare(nameB, 'ta-IN', { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  };

  // Fetch items
  useEffect(() => {
    setIsLoading(true);
    instances.get("/item/items")
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : [];
        // ✅ Apply Tamil alphabetical sorting on initial load
        const sortedItems = sortTamilAlphabetically(items);
        setTotalItems(sortedItems);
        setFilteredItems(sortedItems);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Cannot fetch items", error);
        setIsLoading(false);
      });
  }, []);

  // Search items (debounced) - queries backend which handles Tanglish→Tamil
  const searchItems = async (query) => {
    const q = (query || "").trim();
    if (!q) {
      setFilteredItems(totalItems);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await instances.get(`/item/search?query=${encodeURIComponent(q)}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setFilteredItems(sortTamilAlphabetically(items));
      console.log("Search results for", q, items);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Stats calculations
  const totalItemCount = filteredItems.length;
  const uniqueItems = [...new Set(filteredItems.map(item => item.itemname))].length;
  
  const stats = [
    { 
      title: "Total Items", 
      value: totalItemCount.toString(), 
      icon: <Package className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "Registered" 
    },
    { 
      title: "Unique Items", 
      value: uniqueItems.toString(), 
      icon: <Box className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "Different" 
    },
    { 
      title: "Tamil Order", 
      value: "A-Z", 
      icon: <Database className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "Sorted" 
    },
    { 
      title: "Stock Status", 
      value: "Active", 
      icon: <BarChart3 className="w-6 h-6" />, 
      color: "from-green-600 to-emerald-600", 
      change: "Current" 
    },
  ];

  const tableHeaders = ["S.No", "Item Name"];
  const tableRows = filteredItems.map((item, index) => [
  index + 1, // Just the number
  item.itemname // Just the name (ReportLayout handles the bold/style)
]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-slate-600 font-medium text-lg">Loading item data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* ✅ GREEN Background (Same as other pages) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
              <span className="text-green-600">Item Report</span>
            </h1>
          </div>
          <p className="text-slate-600 mb-4">Comprehensive inventory item analysis and reporting (Tamil A-Z Order)</p>
        </motion.div>


      

        

        {/* Table Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.6 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Item Inventory ({filteredItems.length} items - Tamil A-Z Order)
              </h3>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-green-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (searchTimeout.current) clearTimeout(searchTimeout.current);
                      searchTimeout.current = setTimeout(() => searchItems(e.target.value), 300);
                    }}
                    onKeyDown={handleEnterNavigation}
                    placeholder="Search items (Tanglish → Tamil)"
                    className="pl-10 pr-3 py-2 rounded-md border bg-white/90 text-sm"
                  />
                </div>
                {isSearching && <div className="text-sm text-slate-500">Searching...</div>}

                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setOpenPreview(true)} 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Report</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  {['S.No', 'Item Name'].map((header, index) => (
                    <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: index * 0.05 }}
                      >
                        {header}
                      </motion.div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredItems.map((item, i) => (
                    <motion.tr
                      key={item.itemid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-green-50/50 transition-colors duration-200 border-b border-slate-100"
                    >
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                        <div className="flex items-center">
                          <Box className="w-4 h-4 text-green-500 mr-2" />
                          {item.itemname}
                        </div>
                      </td>
                      
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No items found</h3>
                <p className="text-slate-500">Try adjusting your search criteria</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        reportRef={reportRef}
        title="Item Inventory Report"
      >
        <ReportLayout 
          title="Item Inventory Report (Tamil A-Z Order)"
          headerData={{
            totalItems: totalItemCount,
            reportDate: new Date().toLocaleDateString(),
            searchTerm: searchTerm || "All Items",
            sortingOrder: "Tamil Alphabetical A-Z"
          }}  
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          footerData={{ 
            generatedOn: new Date().toLocaleDateString(),
            totalItems: totalItemCount,
            searchCriteria: searchTerm || "No filters applied",
            note: "Items sorted in Tamil alphabetical order"
          }}
        />
      </ReportPreviewModal>

      {/* ✅ GREEN Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Itemreport;
