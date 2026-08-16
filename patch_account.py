import sys
import os

filepath = "src/delivery/DeliveryAccount.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target_effect = """  useEffect(() => {
    if (user.hub_id) {"""

replacement_effect = """  // Fetch latest user data when Account tab mounts to get fresh ratings
  useEffect(() => {
    fetch(`http://192.168.0.112:8000/api/delivery-personnel/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.id && (data.rating !== user.rating || data.total_ratings !== user.total_ratings)) {
          setUser(prev => ({...prev, ...data}));
        }
      })
      .catch(console.error);
  }, [user.id, setUser]);

  useEffect(() => {
    if (user.hub_id) {"""

if target_effect in content:
    content = content.replace(target_effect, replacement_effect)
    print("Successfully patched DeliveryAccount.jsx")
else:
    print("Could not find target block")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
