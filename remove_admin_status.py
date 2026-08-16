import sys

with open('src/admin/Orders.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

indices_to_remove = set()

# ETA State lines 10-14 (0-indexed 9-13)
indices_to_remove.update(range(9, 14))

# updateOrderStatus lines 49-73 (0-indexed 48-72)
indices_to_remove.update(range(48, 73))

# Status Buttons lines 279-348 (0-indexed 278-347)
indices_to_remove.update(range(278, 348))

new_lines = []
for i, line in enumerate(lines):
    if i not in indices_to_remove:
        new_lines.append(line)

with open('src/admin/Orders.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed status update controls from Orders.jsx")
