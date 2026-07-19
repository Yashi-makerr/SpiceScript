const MenuItem = require('../models/MenuItem');

const seedMenuItems = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count >= 8) {
      console.log('ℹ️ Menu items already exist in database. Skipping seed.');
      return;
    }

    // Clear existing items if fewer than 8 to ensure clean seed
    await MenuItem.deleteMany({});

    const defaultItems = [
      {
        name: 'Grilled Fish',
        description: 'Freshly prepared grilled fish served with signature herbs and lemon slices.',
        price: 350,
        category: 'other',
        imageUrl: 'images/card-img-1.png',
        isAvailable: true
      },
      {
        name: 'Fudge Cake',
        description: 'A rich chocolate fudge cake slice, baked to perfection with premium ingredients.',
        price: 250,
        category: 'other',
        imageUrl: 'images/card-img-2.png',
        isAvailable: true
      },
      {
        name: 'Baked Lobster tail',
        description: 'Premium baked lobster tail with melted garlic butter and green herbs.',
        price: 600,
        category: 'other',
        imageUrl: 'images/card-img-3.png',
        isAvailable: true
      },
      {
        name: 'Fluffy Pancakes',
        description: 'Soft, fluffy round cakes made from flour, milk, and eggs, served with syrup.',
        price: 199,
        category: 'other',
        imageUrl: 'images/gallery-img-1.jpg',
        isAvailable: true
      },
      {
        name: 'Mini Cupcakes',
        description: 'Miniature cakes baked in cups, topped with colorful frosting and sprinkles.',
        price: 149,
        category: 'other',
        imageUrl: 'images/gallery-img-2.jpg',
        isAvailable: true
      },
      {
        name: 'Classic Hummus Dip',
        description: 'A creamy Middle Eastern dip made from chickpeas, tahini, lemon, and garlic.',
        price: 180,
        category: 'other',
        imageUrl: 'images/gallery-img-3.jpg',
        isAvailable: true
      },
      {
        name: 'Cheesy Hamburger',
        description: 'A sandwich made with a juicy beef patty in a bun, lettuce, cheese, and sauces.',
        price: 220,
        category: 'burger',
        imageUrl: 'images/cheesy_hamburger.png',
        isAvailable: true
      },
      {
        name: 'Crunchy Chicken Burger',
        description: 'Crispy chicken patty with lettuce, tomatoes, cheese, and burger mayo.',
        price: 249,
        category: 'burger',
        imageUrl: 'images/chicken_burger.png',
        isAvailable: true
      },
      {
        name: 'Pepperoni & Cheese Pizza',
        description: 'A loaded Italian styled pizza with spicy pepperoni slices and mozzarella cheese.',
        price: 399,
        category: 'pizza',
        imageUrl: 'images/pepperoni_pizza.png',
        isAvailable: true
      },
      {
        name: 'Margherita Garden Pizza',
        description: 'Traditional pizza topped with fresh tomato sauce, basil leaves, and olive oil.',
        price: 299,
        category: 'pizza',
        imageUrl: 'images/margherita_pizza.png',
        isAvailable: true
      },
      {
        name: 'Fresh Orange Cooler',
        description: 'Freshly squeezed orange juice served chilled over crushed ice.',
        price: 99,
        category: 'drinks',
        imageUrl: 'images/orange_cooler.png',
        isAvailable: true
      },
      {
        name: 'Iced Latte Coffee',
        description: 'Premium espresso shot mixed with fresh cold milk and vanilla syrup.',
        price: 120,
        category: 'drinks',
        imageUrl: 'images/iced_latte.png',
        isAvailable: true
      }
    ];

    await MenuItem.insertMany(defaultItems);
    console.log('✅ Default menu items seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = { seedMenuItems };
