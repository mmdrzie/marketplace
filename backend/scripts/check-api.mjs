const res = await fetch('http://localhost:3000/api/v1/categories');
const data = await res.json();
const vehicles = data.data.find(c => c.slug === 'vehicles');
console.log('vehicles children:', vehicles?.children?.length || 0);
if (vehicles?.children) {
  for (const child of vehicles.children) {
    console.log(' -', child.slug, child.name, 'children:', child.children?.length || 0);
  }
}
const truck = data.data.find(c => c.slug === 'truck');
console.log('\ntruck children:', truck?.children?.length || 0);
if (truck?.children) {
  for (const child of truck.children) {
    console.log(' -', child.slug, child.name, 'children:', child.children?.length || 0);
  }
}
