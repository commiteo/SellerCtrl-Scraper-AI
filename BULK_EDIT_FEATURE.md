# 🎯 Bulk Edit Feature

## ✅ **Added Feature:**

### **1. Bulk Edit Multiple Products Settings**
- ✅ **"Bulk Edit" button** in Header
- ✅ **Checkbox for each product** in bulk edit mode
- ✅ **Action bar** showing number of selected products
- ✅ **Custom Modal** for bulk settings editing
- ✅ **Instant update** in database and interface

## 🎯 **How to Use:**

### **1. Enable Bulk Edit Mode:**
1. Go to **Price Monitor** page
2. Click **"Bulk Edit"** button in Header
3. An **orange bar** will appear with selection options

### **2. Select Products:**
1. **Select single product**: Click checkbox next to product
2. **Select all products**: Click checkbox in table header
3. **Deselect**: Click "Deselect All" in orange bar

### **3. Edit Settings:**
1. Click **"Edit Settings"** in orange bar
2. A **Modal** will appear with editing options:
   - **Scrape Interval**: 15 minutes, 30 minutes, 1 hour, etc.
   - **Alert Threshold**: Percentage change required for alert
   - **Status**: Active or Inactive
3. Click **"Apply Changes"** to save changes

### **4. Delete Selected Products:**
1. Select products to delete
2. Click **"Delete Selected"** in orange bar
3. Confirm deletion in popup window

## 🔧 **Technical Features:**

### **1. Selection State Management:**
```typescript
// Bulk selection state
const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
const [isBulkEditMode, setIsBulkEditMode] = useState(false);

// Function to toggle product selection
const toggleProductSelection = (productId: string) => {
  setSelectedProducts(prev => 
    prev.includes(productId) 
      ? prev.filter(id => id !== productId)
      : [...prev, productId]
  );
};
```

### **2. Select All Products:**
```typescript
// Function to select all products
const selectAllProducts = () => {
  setSelectedProducts(monitoredProducts.map(product => product.id));
};

// Function to deselect all products
const deselectAllProducts = () => {
  setSelectedProducts([]);
};
```

### **3. Apply Bulk Changes:**
```typescript
// Function to apply bulk changes
const applyBulkEdit = async () => {
  try {
    setLoading(true);

    // Update selected products in database
    const { error } = await supabase
      .from('price_monitor_products')
      .update({
        scrape_interval: bulkEditModal.newInterval,
        alert_threshold: bulkEditModal.newThreshold,
        is_active: bulkEditModal.newStatus,
        updated_at: new Date().toISOString()
      })
      .in('id', selectedProducts);

    if (error) throw error;

    // Update local list
    const updatedProducts = monitoredProducts.map(product => 
      selectedProducts.includes(product.id)
        ? {
            ...product,
            scrape_interval: bulkEditModal.newInterval,
            alert_threshold: bulkEditModal.newThreshold,
            is_active: bulkEditModal.newStatus,
            updated_at: new Date().toISOString()
          }
        : product
    );
    updateMonitoredProducts(updatedProducts);

    toast({
      title: "✅ Updated",
      description: `Successfully updated ${selectedProducts.length} products`,
    });

  } catch (error) {
    console.error('Error applying bulk edit:', error);
    toast({
      title: "❌ Error",
      description: "An error occurred while updating products",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

## 🎨 **Design and Interface:**

### **1. Bulk Edit Button:**
```tsx
<Button
  onClick={toggleBulkEditMode}
  variant={isBulkEditMode ? "default" : "outline"}
  className={`h-9 sm:h-10 ${isBulkEditMode ? 'bg-[#FF7A00] hover:bg-[#EA580C] text-white' : 'border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]'}`}
>
  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
  {isBulkEditMode ? 'Cancel Selection' : 'Bulk Edit'}
</Button>
```

### **2. Action Bar:**
```tsx
{isBulkEditMode && (
  <Card className="dashboard-card border-[#FF7A00] bg-[#FF7A00]/10">
    <CardContent className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#FF7A00]" />
            <span className="text-[#FFFFFF] font-medium">
              {selectedProducts.length} products selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={selectAllProducts} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={deselectAllProducts} variant="outline" size="sm">
              Deselect All
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={openBulkEditModal} className="bg-[#FF7A00] hover:bg-[#EA580C]">
            <Settings className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
          <Button onClick={deleteSelectedProducts} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### **3. Checkbox in Table:**
```tsx
{isBulkEditMode && (
  <TableHead className="text-[#E0E0E0]/90 text-xs sm:text-sm w-12">
    <input
      type="checkbox"
      checked={selectedProducts.length === monitoredProducts.length && monitoredProducts.length > 0}
      onChange={(e) => e.target.checked ? selectAllProducts() : deselectAllProducts()}
      className="w-4 h-4 text-[#FF7A00] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FF7A00] focus:ring-2"
    />
  </TableHead>
)}

// In product rows
{isBulkEditMode && (
  <TableCell className="w-12">
    <input
      type="checkbox"
      checked={selectedProducts.includes(product.id)}
      onChange={() => toggleProductSelection(product.id)}
      className="w-4 h-4 text-[#FF7A00] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#FF7A00] focus:ring-2"
    />
  </TableCell>
)}
```

### **4. Bulk Edit Modal:**
```tsx
<Dialog open={bulkEditModal.isOpen} onOpenChange={closeBulkEditModal}>
  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-md">
    <DialogHeader>
      <DialogTitle className="text-[#FFFFFF] text-lg">Bulk Edit Settings</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4 text-[#FFFFFF]">
      {/* Selected products details */}
      <div className="space-y-2">
        <div className="text-[#E0E0E0] font-medium">
          {selectedProducts.length} products selected
        </div>
        <div className="text-[#A3A3A3] text-sm">
          The following settings will be applied to all selected products
        </div>
      </div>
      
      {/* Edit options */}
      <div className="space-y-4">
        {/* Scrape Interval */}
        <div className="space-y-2">
          <Label className="text-[#E0E0E0] text-sm">Scrape Interval</Label>
          <Select value={bulkEditModal.newInterval.toString()} onValueChange={(value) => setBulkEditModal(prev => ({ ...prev, newInterval: parseInt(value) }))}>
            <SelectTrigger className="bg-[#2A2A2A] border-[#404040] text-[#FFFFFF]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2A2A2A] border-[#404040]">
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
              <SelectItem value="480">8 hours</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alert Threshold */}
        <div className="space-y-2">
          <Label className="text-[#E0E0E0] text-sm">Alert Threshold (%)</Label>
          <Input
            type="number"
            value={bulkEditModal.newThreshold}
            onChange={(e) => setBulkEditModal(prev => ({ ...prev, newThreshold: parseInt(e.target.value) || 0 }))}
            className="bg-[#2A2A2A] border-[#404040] text-[#FFFFFF]"
            min="0"
            max="100"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-[#E0E0E0] text-sm">Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="bulkStatus"
              checked={bulkEditModal.newStatus}
              onCheckedChange={(checked) => setBulkEditModal(prev => ({ ...prev, newStatus: checked }))}
            />
            <Label htmlFor="bulkStatus" className="text-[#E0E0E0] text-sm">
              {bulkEditModal.newStatus ? 'Active' : 'Inactive'}
            </Label>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={closeBulkEditModal}>
          Cancel
        </Button>
        <Button onClick={applyBulkEdit} className="bg-[#FF7A00] hover:bg-[#EA580C] text-white">
          Apply Changes
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## 📊 **Use Cases:**

### **1. Edit Scrape Interval:**
- **From 15 minutes to 30 minutes**: For more accurate monitoring
- **From 1 hour to 4 hours**: To reduce server load
- **From 24 hours to 1 hour**: For more frequent monitoring

### **2. Edit Alert Threshold:**
- **From 5% to 10%**: To reduce unimportant alerts
- **From 10% to 5%**: To monitor small changes
- **From 5% to 2%**: For very precise monitoring

### **3. Activate/Deactivate Products:**
- **Activate multiple products**: After adding new products
- **Deactivate products**: For products that don't need temporary monitoring

### **4. Delete Multiple Products:**
- **Clean old products**: Delete products that are no longer needed
- **Delete unavailable products**: Remove products that are no longer available

## 🔒 **Security and Validation:**

### **1. Selection Validation:**
```typescript
// Check if products are selected
if (selectedProducts.length === 0) {
  toast({
    title: "❌ Error",
    description: "Please select at least one product",
    variant: "destructive",
  });
  return;
}
```

### **2. Delete Confirmation:**
```typescript
// Confirm product deletion
if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
  return;
}
```

### **3. Error Handling:**
```typescript
try {
  // Apply changes
  const { error } = await supabase.from('price_monitor_products').update({...});
  
  if (error) {
    console.error('Error updating products:', error);
    toast({
      title: "❌ Error",
      description: "Failed to update products",
      variant: "destructive",
    });
    return;
  }
  
  // Success update
  toast({
    title: "✅ Updated",
    description: `Successfully updated ${selectedProducts.length} products`,
  });
  
} catch (error) {
  console.error('Error applying bulk edit:', error);
  toast({
    title: "❌ Error",
    description: "An error occurred while updating products",
    variant: "destructive",
  });
}
```

## 🎯 **Benefits:**

### **1. For Users:**
- ✅ **Time saving** by editing multiple products at once
- ✅ **Complete flexibility** in choosing products to edit
- ✅ **Easy interface** and simple to use
- ✅ **Better control** in product management

### **2. For System:**
- ✅ **Performance improvement** with bulk database updates
- ✅ **Reduced requests** to server
- ✅ **Better resource management**
- ✅ **Better product organization**

## 🚀 **Next Steps:**

### **1. Immediate Improvements:**
- [ ] Add **product filtering** by region or status
- [ ] Add **search in selected products**
- [ ] Add **export selected products**

### **2. Medium-term Improvements:**
- [ ] Add **settings templates** for quick setup
- [ ] Add **schedule edits** for future
- [ ] Add **statistics** for selected products

### **3. Long-term Improvements:**
- [ ] Add **artificial intelligence** to suggest optimal settings
- [ ] Add **sync** with personal calendar
- [ ] Add **smart alerts** for important changes

---

**Note**: The feature is ready for use and fully tested. Users can now edit multiple product settings at the same time with ease and complete flexibility! 🎯✨ 