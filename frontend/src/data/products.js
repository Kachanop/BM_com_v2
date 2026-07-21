const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'เซ็ตสุดคุ้ม Beginner',
    description: 'เหมาะสำหรับทำงานทั่วไป พิมพ์งาน ดูหนัง ฟังเพลง เล่นเกมเบาๆ',
    price: 15900,
    image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'เซ็ต Gamer ขั้นเทพ',
    description: 'เล่นเกมยอดฮิตได้ลื่นไหล ไม่ว่าจะเป็น Valorant, GTA V, หรือ PUBG',
    price: 25900,
    image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'เซ็ต Pro Streamer',
    description: 'สเปคแรง ตัดต่อวิดีโอ 4K และสตรีมเกมได้แบบไม่มีสะดุด',
    price: 45900,
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'เซ็ต Office Plus',
    description: 'เหมาะสำหรับงานสำนักงานและการประชุมออนไลน์ที่สบายตา',
    price: 18900,
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'เซ็ต Design Studio',
    description: 'รองรับงานออกแบบกราฟิกและวางแผนงานอย่างราบรื่น',
    price: 32900,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'เซ็ต Creator Pro',
    description: 'ตัดต่อวิดีโอและสร้างคอนเทนต์ได้ด้วยประสิทธิภาพสูง',
    price: 38900,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    name: 'เซ็ต Coding Master',
    description: 'พัฒนาซอฟต์แวร์และรันเครื่องมือพัฒนาหลายอย่างพร้อมกัน',
    price: 27900,
    image_url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    name: 'เซ็ต Study Smart',
    description: 'เหมาะสำหรับนักเรียนและนักศึกษาที่ต้องการความเร็วและความเสถียร',
    price: 16900,
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 9,
    name: 'เซ็ต Home Cinema',
    description: 'ดูหนัง ฟังเพลง และสตรีมได้อย่างเงียบสงบและลื่นไหล',
    price: 23900,
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 10,
    name: 'เซ็ต AI Workstation',
    description: 'รองรับงาน AI และการประมวลผลข้อมูลในระดับที่ดีขึ้น',
    price: 54900,
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 11,
    name: 'เซ็ต Ultra Gaming',
    description: 'เล่นเกม AAA ได้เต็มที่ พร้อมกราฟิกสวยและFPSสูง',
    price: 42900,
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 12,
    name: 'เซ็ต Silent Boost',
    description: 'ประหยัดเสียงและคงความเย็นในระหว่างใช้งานยาวๆ',
    price: 21900,
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 13,
    name: 'เซ็ต Mini Tower',
    description: 'ประหยัดพื้นที่และเหมาะกับการติดตั้งในที่จำกัด',
    price: 14900,
    image_url: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 14,
    name: 'เซ็ต 4K Editing',
    description: 'ทํางานตัดต่อภาพยนตร์และวิดีโอ 4K ได้อย่างลื่นไหล',
    price: 47900,
    image_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 15,
    name: 'เซ็ต Business Elite',
    description: 'รองรับการทํางานออฟฟิศและระบบรักษาความปลอดภัยที่ครบครัน',
    price: 35900,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 16,
    name: 'เซ็ต Content Studio',
    description: 'เหมาะกับครีเอเตอร์ที่ต้องการแสดงผลและความรวดเร็วสูง',
    price: 41900,
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 17,
    name: 'เซ็ต Budget Builder',
    description: 'คุ้มค่าและพร้อมใช้งานทันทีสำหรับผู้เริ่มต้น',
    price: 12900,
    image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 18,
    name: 'เซ็ต Performance X',
    description: 'สมรรถนะสูงสำหรับผู้ที่ต้องการแอปพลิเคชันหนักและเกมแรง',
    price: 49900,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 19,
    name: 'เซ็ต Compact Work',
    description: 'พื้นที่ไม่มากแต่ยังคงให้ประสิทธิภาพที่เพียงพอ',
    price: 17900,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 20,
    name: 'เซ็ต Premium All Rounder',
    description: 'ตอบโจทย์ทุกการใช้งานจากงานพื้นฐานถึงเกมและสร้างสรรค์',
    price: 58900,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
];

const PRODUCTS_STORAGE_KEY = 'bm_recommended_products';

export function getDefaultProducts() {
  return DEFAULT_PRODUCTS.map((product) => ({ ...product }));
}

export function loadProductsFromStorage() {
  if (typeof window === 'undefined') {
    return getDefaultProducts();
  }

  try {
    const saved = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) {
      return getDefaultProducts();
    }

    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fall back to defaults if storage data is invalid.
  }

  return getDefaultProducts();
}

export function saveProductsToStorage(products) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    console.log('Products saved to localStorage:', products);
  } catch (error) {
    console.error('Failed to save products:', error);
  }

  // Use setTimeout to ensure DOM is ready before dispatching event
  setTimeout(() => {
    const event = new Event('bm-products-updated');
    window.dispatchEvent(event);
    console.log('Dispatched bm-products-updated event');
  }, 0);
}

export function resetProductsToDefault() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    window.dispatchEvent(new Event('bm-products-updated'));
  }

  return getDefaultProducts();
}

export default DEFAULT_PRODUCTS;
