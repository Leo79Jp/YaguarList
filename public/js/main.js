import { getStoredItems, addItem, updateItem, deleteItem, toggleItemCompleted, resetPurchase, updateItemsOrder, importItemsFromText } from './storage.js';
import { initSwipeGesture } from './gestures.js';

let currentItems = [];
let isShoppingMode = false;
let lastToggledId = null;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  let serverItems = [];
  try {
    const dataElement = document.getElementById('initial-data');
    if (dataElement) {
      serverItems = JSON.parse(dataElement.textContent);
    }
  } catch (e) {
    serverItems = [];
  }

  currentItems = getStoredItems(serverItems);
  initUI();
  renderApp();
});

function initUI() {
  initAddForm();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderEditList(currentItems);
    });
  }

  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      isShoppingMode = !isShoppingMode;
      renderApp();
    });
  }

  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (lastToggledId) {
        currentItems = toggleItemCompleted(currentItems, lastToggledId);
        lastToggledId = null;
        renderApp();
      }
    });
  }

  const newPurchaseBtn = document.getElementById('new-purchase-btn');
  if (newPurchaseBtn) {
    newPurchaseBtn.addEventListener('click', () => {
      if (confirm('¿Deseas iniciar una nueva compra? Se desmarcarán todos los productos.')) {
        currentItems = resetPurchase(currentItems);
        lastToggledId = null;
        renderApp();
      }
    });
  }

  const importBtn = document.getElementById('import-btn');
  const importModal = document.getElementById('import-modal');
  const cancelImportBtn = document.getElementById('cancel-import-btn');
  const confirmImportBtn = document.getElementById('confirm-import-btn');
  const importTextarea = document.getElementById('import-textarea');

  if (importBtn && importModal) {
    importBtn.addEventListener('click', () => {
      importModal.style.display = 'flex';
      if (importTextarea) importTextarea.value = '';
      if (importTextarea) importTextarea.focus();
    });
  }

  if (cancelImportBtn && importModal) {
    cancelImportBtn.addEventListener('click', () => {
      importModal.style.display = 'none';
    });
  }

  if (confirmImportBtn && importModal && importTextarea) {
    confirmImportBtn.addEventListener('click', () => {
      const text = importTextarea.value;
      if (text.trim()) {
        currentItems = importItemsFromText(currentItems, text);
        renderApp();
      }
      importModal.style.display = 'none';
    });
  }
}

function renderApp() {
  const editSection = document.getElementById('edit-mode-section');
  const shoppingSection = document.getElementById('shopping-mode-section');
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const undoBtn = document.getElementById('undo-btn');

  if (isShoppingMode) {
    editSection.style.display = 'none';
    shoppingSection.style.display = 'block';
    modeToggleBtn.textContent = 'Editar lista';
    modeToggleBtn.className = 'btn-secondary';
    renderShoppingMode();
  } else {
    editSection.style.display = 'block';
    shoppingSection.style.display = 'none';
    modeToggleBtn.textContent = 'Modo Compra';
    modeToggleBtn.className = 'btn-primary';
    renderEditList(currentItems);
  }

  if (undoBtn) {
    undoBtn.style.display = lastToggledId ? 'inline-block' : 'none';
  }
}

function renderEditList(items) {
  const pendingContainer = document.getElementById('pending-list');
  const completedContainer = document.getElementById('completed-list');
  const completedSection = document.getElementById('completed-section');

  if (!pendingContainer || !completedContainer) return;

  pendingContainer.innerHTML = '';
  completedContainer.innerHTML = '';

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery))
    : items;

  const pendingItems = filteredItems.filter(item => !item.completed);
  const completedItems = filteredItems.filter(item => item.completed);

  if (pendingItems.length === 0) {
    pendingContainer.innerHTML = `<li class="empty-message">No hay productos pendientes.</li>`;
  } else {
    pendingItems.forEach((item, index) => {
      pendingContainer.appendChild(createProductElement(item, false, index, pendingItems.length));
    });
  }

  if (completedItems.length > 0) {
    completedSection.style.display = 'block';
    completedItems.forEach((item, index) => {
      completedContainer.appendChild(createProductElement(item, false, index, completedItems.length));
    });
  } else {
    completedSection.style.display = 'none';
  }
}

function renderShoppingMode() {
  const shoppingPending = document.getElementById('shopping-pending-list');
  const shoppingCompleted = document.getElementById('shopping-completed-list');
  const completedDivider = document.querySelector('.shopping-completed-divider');
  const progressText = document.getElementById('progress-text');
  const progressBarFill = document.getElementById('progress-bar-fill');

  if (!shoppingPending || !shoppingCompleted) return;

  shoppingPending.innerHTML = '';
  shoppingCompleted.innerHTML = '';

  const total = currentItems.length;
  const completedCount = currentItems.filter(item => item.completed).length;

  if (progressText) progressText.textContent = `${completedCount} de ${total} productos`;
  if (progressBarFill) {
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;
    progressBarFill.style.width = `${percentage}%`;
  }

  const pendingItems = currentItems.filter(item => !item.completed);
  const completedItems = currentItems.filter(item => item.completed);

  if (pendingItems.length === 0 && total > 0) {
    shoppingPending.innerHTML = `<li class="empty-message success-msg">¡Lista completada! 🎉</li>`;
  } else if (pendingItems.length === 0) {
    shoppingPending.innerHTML = `<li class="empty-message">No hay productos en la lista.</li>`;
  } else {
    pendingItems.forEach(item => {
      shoppingPending.appendChild(createProductElement(item, true));
    });
  }

  if (completedItems.length > 0) {
    if (completedDivider) completedDivider.style.display = 'block';
    completedItems.forEach(item => {
      shoppingCompleted.appendChild(createProductElement(item, true));
    });
  } else {
    if (completedDivider) completedDivider.style.display = 'none';
  }
}

function moveItem(id, direction) {
  const index = currentItems.findIndex(i => i.id === id);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentItems.length) return;

  const newItems = [...currentItems];
  const [movedItem] = newItems.splice(index, 1);
  newItems.splice(targetIndex, 0, movedItem);

  currentItems = updateItemsOrder(currentItems, newItems);
  renderApp();
}

function createProductElement(item, isShopping, index = 0, totalLength = 0) {
  const li = document.createElement('li');
  li.className = `product-item ${item.completed ? 'completed' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'product-checkbox';
  checkbox.checked = item.completed;
  checkbox.addEventListener('change', () => {
    lastToggledId = item.id;
    currentItems = toggleItemCompleted(currentItems, item.id);
    renderApp();
  });

  const span = document.createElement('span');
  span.className = 'product-name';
  span.textContent = item.name;
  span.addEventListener('click', () => {
    lastToggledId = item.id;
    currentItems = toggleItemCompleted(currentItems, item.id);
    renderApp();
  });

  li.appendChild(checkbox);
  li.appendChild(span);

  if (isShopping) {
    initSwipeGesture(
      li,
      () => {
        setTimeout(() => {
          lastToggledId = item.id;
          currentItems = toggleItemCompleted(currentItems, item.id);
          renderApp();
        }, 50);
      },
      () => {
        setTimeout(() => {
          if (confirm(`¿Eliminar "${item.name}"?`)) {
            currentItems = deleteItem(currentItems, item.id);
            renderApp();
          }
        }, 50);
      }
    );
  } else {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'product-actions';

    const upBtn = document.createElement('button');
    upBtn.className = 'btn-action btn-move';
    upBtn.textContent = '▲';
    upBtn.title = 'Subir';
    if (index === 0) upBtn.disabled = true;
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveItem(item.id, -1);
    });

    const downBtn = document.createElement('button');
    downBtn.className = 'btn-action btn-move';
    downBtn.textContent = '▼';
    downBtn.title = 'Bajar';
    if (index === totalLength - 1) downBtn.disabled = true;
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveItem(item.id, 1);
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-action btn-edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Editar';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = prompt('Editar producto:', item.name);
      if (newName !== null) {
        currentItems = updateItem(currentItems, item.id, newName);
        renderApp();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-action btn-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentItems = deleteItem(currentItems, item.id);
      renderApp();
    });

    actionsDiv.appendChild(upBtn);
    actionsDiv.appendChild(downBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
  }

  return li;
}

function initAddForm() {
  const form = document.getElementById('add-form');
  const input = document.getElementById('product-input');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const productName = input.value;
    if (!productName.trim()) return;
    currentItems = addItem(currentItems, productName);
    renderApp();
    input.value = '';
    input.focus();
  });
}