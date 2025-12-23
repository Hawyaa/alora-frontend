// utils/cartDebug.ts
export const debugCartState = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 CART STATE DEBUG');
    console.log('==================');
    
    // Get current user
    const userData = localStorage.getItem('alora-user');
    const user = userData ? JSON.parse(userData) : null;
    console.log('👤 Current user:', user?.email || 'Guest');
    
    // Expected cart key
    const expectedKey = user ? `alora-cart-${user.email}` : 'alora-cart-guest';
    console.log('🔑 Expected cart key:', expectedKey);
    
    // List all cart storage
    console.log('📦 All cart storage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('cart')) {
        const value = localStorage.getItem(key);
        try {
          const items = value ? JSON.parse(value) : [];
          console.log(`  ${key}: ${items.length} items`);
          if (items.length > 0) {
            console.log('    Items:', items.map((item: any) => `${item.name} (x${item.quantity})`).join(', '));
          }
        } catch (e) {
          console.log(`  ${key}: Error parsing`);
        }
      }
    }
    
    console.log('==================');
  };
  
  // Add this to your login/logout buttons for testing
  export const testUserSwitch = () => {
    console.log('🧪 TESTING USER SWITCH');
    console.log('1. Current state:');
    debugCartState();
    
    console.log('\n2. Simulating logout...');
    localStorage.removeItem('alora-token');
    localStorage.removeItem('alora-user');
    
    console.log('\n3. New state (should be guest):');
    debugCartState();
    
    alert('Test complete. Check console for details.');
  };