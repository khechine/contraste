const TOKEN = process.env.TOKEN || 'dAY_XRtLjj3BjfBtIyKfAxLzePTKOhSQ';
const BASE_URL = 'http://localhost:8055';

async function cleanupDuplicates() {
  const response = await fetch(`${BASE_URL}/items/news?limit=-1&sort=date_created`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const result = await response.json();
  const news = result.data || [];
  console.log(`Found ${news.length} total news items`);
  
  const seen = new Set();
  const toDelete = [];
  
  for (const item of news.sort((a,b) => new Date(b.date_created) - new Date(a.date_created))) {
    const key = `${item.title}-${item.slug || ''}`.slice(0,100);
    if (seen.has(key)) {
      toDelete.push(item.id);
    } else {
      seen.add(key);
    }
  }
  
  console.log(`Found ${toDelete.length} duplicates to delete. Keeping latest unique:`, seen.size);
  
  for (const id of toDelete) {
    await fetch(`${BASE_URL}/items/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log(`Deleted duplicate news/${id}`);
  }
  
  console.log('Cleanup complete!');
}

cleanupDuplicates().catch(console.error);

