import sys
import os

filepath = "src/delivery/DeliveryDashboard.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target_imports = "import { MapPin, Phone, Package, Clock, CheckCircle, User } from 'lucide-react';"
replacement_imports = "import { MapPin, Phone, Package, Clock, CheckCircle, User, Bell } from 'lucide-react';\nimport { useRef } from 'react';"

target_state = """  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);"""
replacement_state = """  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevOrderIds = useRef(new Set());
  const [notificationPermission, setNotificationPermission] = useState('default');"""

target_fetch = """  const fetchOrders = () => {
    fetch(`http://192.168.0.112:8000/api/delivery/orders/${user.email}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user.email]);"""

replacement_fetch = """  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const fetchOrders = () => {
    fetch(`http://192.168.0.112:8000/api/delivery/orders/${user.email}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
        
        const activeOrders = data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
        const currentOrderIds = new Set(activeOrders.map(o => o.id));
        
        // Check for new orders if not the first load
        if (prevOrderIds.current.size > 0) {
          const newOrders = activeOrders.filter(o => !prevOrderIds.current.has(o.id));
          if (newOrders.length > 0) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Delivery Assigned! 📦', {
                body: `You have been assigned ${newOrders.length} new order(s). Open the app to view details.`,
                icon: '/vite.svg'
              });
            } else {
              // Fallback alert if notifications are disabled
              alert(`New Delivery Assigned! You have ${newOrders.length} new order(s).`);
            }
            
            // Play a sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play();
            } catch(e) { console.error("Could not play sound", e); }
          }
        }
        prevOrderIds.current = currentOrderIds;
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [user.email]);"""


if target_imports in content:
    content = content.replace(target_imports, replacement_imports)
    print("Replaced imports")
if target_state in content:
    content = content.replace(target_state, replacement_state)
    print("Replaced state")
if target_fetch in content:
    content = content.replace(target_fetch, replacement_fetch)
    print("Replaced fetch logic")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated DeliveryDashboard.jsx with notification logic")
