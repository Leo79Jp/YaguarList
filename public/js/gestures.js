export function initSwipeGesture(element, onSwipeRight, onSwipeLeft) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  element.addEventListener('pointerdown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    startX = e.clientX;
    isDragging = true;
    element.setPointerCapture(e.pointerId);
  });

  element.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const diffX = currentX - startX;
    
    // Desplazamiento visual limitado para feedback táctil
    if (Math.abs(diffX) < 120) {
      element.style.transform = `translateX(${diffX}px)`;
      if (diffX > 0) {
        element.style.backgroundColor = '#ccfbf1'; // Tono verdoso al deslizar derecha
      } else if (diffX < 0) {
        element.style.backgroundColor = '#fee2e2'; // Tono rojizo al deslizar izquierda
      }
    }
  });

  element.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    element.releasePointerCapture(e.pointerId);
    
    const diffX = currentX - startX;
    element.style.transform = '';
    element.style.backgroundColor = '';

    const threshold = 60;
    if (diffX > threshold) {
      if (onSwipeRight) onSwipeRight();
    } else if (diffX < -threshold) {
      if (onSwipeLeft) onSwipeLeft();
    }
  });

  element.addEventListener('pointercancel', () => {
    isDragging = false;
    element.style.transform = '';
    element.style.backgroundColor = '';
  });
}