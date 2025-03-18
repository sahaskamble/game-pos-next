import { useState, useEffect, useCallback } from 'react';
import pbService from '../services/pocketbase';
import { toast } from 'sonner';

export function useCollection(collectionName, options) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await pbService.getFullList(collectionName, options);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error(`Error fetching ${collectionName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mutate = useCallback(async (newData) => {
    if (newData) {
      // If new data is provided, update the state directly
      setData(newData);
      return;
    }
    // Otherwise, fetch fresh data from the server
    await fetchData();
  }, [collectionName, options]);

  const createItem = async (itemData) => {
    try {
      const created = await pbService.create(collectionName, itemData);
      setData(prev => [...prev, created]);
      toast.success('Item created successfully');
      return created;
    } catch (err) {
      toast.error(`Error creating item: ${err.message}`);
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const updated = await pbService.update(collectionName, id, itemData);
      setData(prev => prev.map(item => item.id === id ? updated : item));
      toast.success('Item updated successfully');
      return updated;
    } catch (err) {
      toast.error(`Error updating item: ${err.message}`);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await pbService.delete(collectionName, id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      toast.error(`Error deleting item: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionName, JSON.stringify(options)]);

  return {
    data,
    loading,
    error,
    mutate,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  };
}
