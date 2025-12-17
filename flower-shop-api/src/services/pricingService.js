const db = require('../config/db');

// Стратегія знижки: беремо відсоток із client_profiles
async function applyDiscount(clientProfile, baseAmount) {
  if (!clientProfile) {
    return { discountAmount: 0, finalAmount: baseAmount };
  }

  const percent = Number(clientProfile.discount_percent) || 0;
  const rawDiscount = baseAmount * (percent / 100);

  let discount = rawDiscount;

  // якщо BONUS — можна обмежити бонусним балансом
  if (clientProfile.card_type === 'BONUS') {
    discount = Math.min(rawDiscount, Number(clientProfile.bonus_balance) || 0);
  }

  return {
    discountAmount: discount,
    finalAmount: baseAmount - discount
  };
}


// Стратегія доставки: безкоштовна, якщо free_delivery = 1
async function calculateDeliveryCost(clientProfile, deliveryOption) {
  if (!deliveryOption) return 0;

  if (clientProfile && clientProfile.free_delivery) {
    return 0;
  }

  return Number(deliveryOption.price) || 0;
}


async function calculateOrderPrice(userId, bouquets, packagingOptionId, deliveryOptionId, extraOptionIds) {
  // 1. Профіль клієнта
  const [profileRows] = await db.query(
    'SELECT * FROM client_profiles WHERE user_id = ?',
    [userId]
  );
  const clientProfile = profileRows[0];

  // 2. Сума букетів
  let bouquetsTotal = 0;
  for (const item of bouquets) {
    const [rows] = await db.query(
      'SELECT base_price FROM bouquets WHERE id = ?',
      [item.bouquet_id]
    );
    if (rows.length === 0) continue;
    const price = Number(rows[0].base_price);
    bouquetsTotal += price * item.quantity;
  }

  // 3. Упаковка
  let packagingPrice = 0;
  let deliveryPrice = 0;
  let extraTotal = 0;

  let packagingOption = null;
  let deliveryOption = null;
  let extraOptions = [];

  if (packagingOptionId) {
    const [rows] = await db.query('SELECT * FROM options WHERE id = ? AND type = "PACKAGING"', [packagingOptionId]);
    if (rows.length > 0) {
      packagingOption = rows[0];
      packagingPrice = Number(rows[0].price);
    }
  }

  if (deliveryOptionId) {
    const [rows] = await db.query('SELECT * FROM options WHERE id = ? AND type = "DELIVERY"', [deliveryOptionId]);
    if (rows.length > 0) {
      deliveryOption = rows[0];
      // поки 0, реальну вартість рахуємо через стратегію нижче
    }
  }

  if (Array.isArray(extraOptionIds) && extraOptionIds.length > 0) {
    const [rows] = await db.query(
      `SELECT * FROM options WHERE id IN (${extraOptionIds.map(() => '?').join(',')}) AND type = "EXTRA"`,
      extraOptionIds
    );
    extraOptions = rows;
    for (const opt of rows) {
      extraTotal += Number(opt.price);
    }
  }

  const baseAmount = bouquetsTotal + packagingPrice + extraTotal;

  // 4. Знижка
  const { discountAmount, finalAmount: afterDiscount } = await applyDiscount(clientProfile, baseAmount);

  // 5. Доставка (з урахуванням GOLD)
  deliveryPrice = await calculateDeliveryCost(clientProfile, deliveryOption);

  const totalPrice = baseAmount + deliveryPrice;
  const finalPrice = afterDiscount + deliveryPrice;

  return {
    clientProfile,
    bouquetsTotal,
    packagingOption,
    deliveryOption,
    extraOptions,
    baseAmount,
    discountAmount,
    deliveryPrice,
    totalPrice,
    finalPrice
  };
}

module.exports = {
  calculateOrderPrice
};
