var info = [];
info.push("=== API KEYS ===");
for (var k in api) {
  info.push(k);
}
info.push("\n=== CAVALRY KEYS ===");
for (var k in cavalry) {
  info.push(k);
}
info.push("\n=== UI KEYS ===");
for (var k in ui) {
  info.push(k);
}

api.writeToFile("C:/Users/blcne/cavalry_api_dump.txt", info.join("\n"), true);
