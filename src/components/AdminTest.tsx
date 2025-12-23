// frontend/src/components/AdminTest.tsx
'use client';

export default function AdminTest() {
  const checkAdmin = () => {
    if (typeof window === 'undefined') return;
    
    const user = JSON.parse(localStorage.getItem('alora-user') || '{}');
    const token = localStorage.getItem('alora-token');
    
    console.log('=== ADMIN STATUS CHECK ===');
    console.log('Token exists:', !!token);
    console.log('User data:', user);
    console.log('Role:', user.role);
    console.log('Is admin:', user.role === 'admin');
    
    // Force refresh to update UI
    window.location.reload();
  };
  
  return (
    <button 
      onClick={checkAdmin}
      className="fixed bottom-4 right-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white p-3 rounded-full shadow-lg z-50"
       
      title="Check Admin Status"
    >
      👑
    </button>
  );
}