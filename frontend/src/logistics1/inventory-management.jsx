import { useState, useEffect } from 'react';
import { Button, Input, Modal, Table, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Add, Edit, Archive } from 'lucide-react';
import axios from 'axios';

const InventoryManagement = () => {
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  // Fetch equipment data from API
  const fetchEquipmentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/equipment'); // Adjust this to your backend API endpoint
      setEquipmentData(response.data);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show modal for editing or adding equipment
  const showModal = (item = null) => {
    setCurrentItem(item);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentItem(null);
  };

  // Handle Save Equipment Data
  const handleSaveEquipment = async (equipment) => {
    setLoading(true);
    try {
      if (currentItem) {
        // Update existing equipment
        await axios.put(`/api/equipment/${currentItem.id}`, equipment);
      } else {
        // Add new equipment
        await axios.post('/api/equipment/add', equipment);
      }
      fetchEquipmentData();
      closeModal();
    } catch (error) {
      console.error('Error saving equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Stock Quantity Update
  const handleStockQuantityUpdate = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/equipment/${itemId}/update-stock`, { stock_quantity: newQuantity });
      fetchEquipmentData();
    } catch (error) {
      console.error('Error updating stock quantity:', error);
    }
  };

  // Handle Archiving Equipment
  const handleArchiveEquipment = async (itemId) => {
    try {
      await axios.put(`/api/equipment/${itemId}/archive-old`);
      fetchEquipmentData();
    } catch (error) {
      console.error('Error archiving equipment:', error);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Equipment Name',
      dataIndex: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'stock_quantity',
      render: (text, record) => (
        <div>
          <Input
            type="number"
            defaultValue={text}
            onBlur={(e) => handleStockQuantityUpdate(record.id, e.target.value)}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <div>
          <Button
            type="primary"
            icon={<Edit />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<Archive />}
            onClick={() => handleArchiveEquipment(record.id)}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  // Modal for adding/editing equipment
  const renderModal = () => {
    return (
      <Modal
        title={currentItem ? 'Edit Equipment' : 'Add New Equipment'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => handleSaveEquipment(currentItem || { name: '', category_name: '', stock_quantity: 0 })}
      >
        <div>
          <Input
            value={currentItem?.name || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            placeholder="Equipment Name"
          />
          <Input
            value={currentItem?.category_name || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, category_name: e.target.value })}
            placeholder="Category Name"
            style={{ marginTop: 8 }}
          />
          <Input
            type="number"
            value={currentItem?.stock_quantity || 0}
            onChange={(e) => setCurrentItem({ ...currentItem, stock_quantity: e.target.value })}
            placeholder="Stock Quantity"
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <Button type="primary" icon={<Add />} onClick={() => showModal()}>
        Add New Equipment
      </Button> 

      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columns}
          dataSource={equipmentData}
          rowKey="id"
          pagination={false}
          style={{ marginTop: 16 }}
        />
      )}

      {renderModal()}
    </div>
  );
};

export default InventoryManagement;
