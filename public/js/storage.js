const STORAGE_KEY = 'yaguar_items';

export function getStoredItems(defaultItems) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
    return defaultItems;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultItems;
  }
}

export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addItem(items, name) {
  const trimmedName = name.trim();
  if (!trimmedName) return items;

  const newItem = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: trimmedName,
    completed: false,
    order: items.length
  };

  const updatedItems = [...items, newItem];
  saveItems(updatedItems);
  return updatedItems;
}

export function updateItem(items, id, newName) {
  const trimmed = newName.trim();
  if (!trimmed) return items;

  const updatedItems = items.map(item =>
    item.id === id ? { ...item, name: trimmed } : item
  );
  saveItems(updatedItems);
  return updatedItems;
}

export function deleteItem(items, id) {
  const updatedItems = items.filter(item => item.id !== id);
  saveItems(updatedItems);
  return updatedItems;
}

export function toggleItemCompleted(items, id) {
  const updatedItems = items.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item
  );
  saveItems(updatedItems);
  return updatedItems;
}

export function resetPurchase(items) {
  const updatedItems = items.map(item => ({ ...item, completed: false }));
  saveItems(updatedItems);
  return updatedItems;
}

export function updateItemsOrder(items, newOrderedItems) {
  saveItems(newOrderedItems);
  return newOrderedItems;
}

export function importItemsFromText(items, text) {
  if (!text || !text.trim()) return items;

  const lines = text.split('\n');
  let newItems = [...items];
  let maxOrder = newItems.length > 0 ? Math.max(...newItems.map(i => i.order)) : -1;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      maxOrder++;
      const newItem = {
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: trimmedLine,
        completed: false,
        order: maxOrder
      };
      newItems.push(newItem);
    }
  });

  saveItems(newItems);
  return newItems;
}