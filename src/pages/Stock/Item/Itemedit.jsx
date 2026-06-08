import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Edit,
  Trash2,
  Package,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import instances from "../../../components/axios";
import UpdateModal from "../../../components/UpdateModal";
import DeleteModal from "../../../components/DeleteModal";

function Itemedit() {
  const [item, setItem] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store original items for search
  const [selectedId, setSelectedId] = useState(null);
  const [newitemname, setNewitemname] = useState("");
  const [popup, setPopup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Enhanced Tamil alphabetical sorting function
  const sortTamilAlphabetically = (list) => {
    return [...list].sort((a, b) => {
      // Tamil Unicode sorting for proper alphabetical order
      const nameA = a.itemname.toLowerCase();
      const nameB = b.itemname.toLowerCase();
      return nameA.localeCompare(nameB, 'ta-IN', { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  };

  const startEdit = (id, name) => {
    setSelectedId(id);
    setNewitemname(name);
    setPopup("edit");
  };

  const startDelete = (id) => {
    setSelectedId(id);
    setNewitemname(item.find((c) => c.itemid === id)?.itemname || "");
    setPopup("delete");
  };

  const fetchItems = () => {
    setIsLoading(true);
    instances
      .get("/item/items")
      .then((response) => {
        const originalItems = response.data || [];
        const sortedItems = sortTamilAlphabetically(originalItems);
        setItem(sortedItems);
        setAllItems(originalItems);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  // ✅ Client-side search function - filters from full item list
  const searchItems = (query) => {
    if (!query.trim()) {
      setItem(sortTamilAlphabetically(allItems));
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const filtered = allItems.filter((i) =>
      i.itemname?.toLowerCase().includes(searchQuery)
    );

    setItem(sortTamilAlphabetically(filtered));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Updated update function with sorting
  const updateitem = async () => {
    if (!newitemname.trim()) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Name cannot be empty';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
      return;
    }

    try {
      await instances.put(`item/${selectedId}`, { itemname: newitemname });
      
      const updatedItems = item.map((c) =>
        c.itemid === selectedId ? { ...c, itemname: newitemname } : c
      );
      
      // ✅ Apply Tamil alphabetical sorting after update
      setItem(sortTamilAlphabetically(updatedItems));

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      successDiv.textContent = 'Item updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

      closepopup();
    } catch (error) {
      console.error(error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Update failed. Please try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
    }
  };

  // ✅ Updated delete function with sorting
  const deleteitem = async () => {
    try {
      await instances.delete(`/item/${selectedId}`);
      
      const remainingItems = item.filter((c) => c.itemid !== selectedId);
      // ✅ Apply Tamil alphabetical sorting after delete
      setItem(sortTamilAlphabetically(remainingItems));

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      successDiv.textContent = 'Item deleted successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

      closepopup();
    } catch (error) {
      console.error(error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Cannot delete item. May have associated records.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
    }
  };

  const closepopup = () => {
    setPopup(null);
    setSelectedId(null);
    setNewitemname("");
  };

  // Stats calculations
  const totalItems = item.length;
  
  const stats = [
    { 
      title: "Total Items", 
      value: totalItems.toString(), 
      icon: <Package className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "Registered" 
    },
    { 
      title: "Search Results", 
      value: item.length.toString(), 
      icon: <Filter className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "Showing" 
    },
    { 
      title: "Tamil Order", 
      value: "A-Z", 
      icon: <Database className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "Sorted" 
    },
    { 
      title: "Status", 
      value: "Ready", 
      icon: <CheckCircle className="w-6 h-6" />, 
      color: "from-green-600 to-emerald-600", 
      change: "System" 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-slate-600 font-medium text-lg">Loading items...</span>
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
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
              <span className="text-green-600">Item Management</span>
            </h1>
          </div>
          <p className="text-slate-600 mb-4">Update and delete inventory items efficiently (Tamil A-Z Order)</p>
        </motion.div>

        {/* Stats */}
        

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-md">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Search Items</h3>
                <p className="text-slate-600 text-sm">Type in Tanglish (kalar) to search Tamil items (கலர்) - Results in Tamil A-Z order</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setSearchQuery("");
                fetchItems();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            {/* ✅ Keep your original search functionality */}
            <input
              type="text"
              placeholder="Search items... (Type 'kalar' for 'கலர்')"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchItems(e.target.value); // ✅ Call your original API search
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all duration-300 text-slate-700 font-medium"
            />
          </div>

          {/* Search hint */}
         
        </motion.div>

        {/* Table Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.6 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
              Item Management ({item.length} items - Tamil A-Z Order)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  {['S.No', 'Item Name', 'Actions'].map((header, index) => (
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
                  {item.map((value, i) => (
                    <motion.tr
                      key={value.itemid}
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
                          <Package className="w-4 h-4 text-green-500 mr-2" />
                          {value.itemname}
                        </div>
                      </td>
                     
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startEdit(value.itemid, value.itemname)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startDelete(value.itemid)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Empty State */}
            {item.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No items found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or refresh to see all items</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ✅ REUSABLE MODALS */}
      <UpdateModal
        isOpen={popup === "edit"}
        newValue={newitemname}
        setNewValue={setNewitemname}
        onUpdate={updateitem}
        onClose={closepopup}
        isLoading={false}
        title="Update Item"
        label="Item Name"
        placeholder="Enter item name"
      />

      <DeleteModal
        isOpen={popup === "delete"}
        itemName={newitemname}
        onDelete={deleteitem}
        onClose={closepopup}
        isLoading={false}
        title="Delete Item"
        message="Are you sure you want to delete this item:"
      />

      {/* ✅ GREEN Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Itemedit;
