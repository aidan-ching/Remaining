export type BarcodeNutrition = {
  name?: string;
  caloriesPerServing?: number;
  servingSize?: string;
  servingsPerContainer?: number;
};

type OpenFoodFactsProduct = {
  product_name?: string;
  serving_size?: string;
  servings_per_container?: number | string;
  nutriments?: Record<string, number | string | undefined>;
};

type OpenFoodFactsResponse = {
  status?: number;
  product?: OpenFoodFactsProduct;
};

const numericValue = (value: number | string | undefined) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

const gramsInServing = (servingSize?: string) => {
  const match = servingSize?.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  return match ? Number(match[1]) : undefined;
};

/** Look up a packaged food in Open Food Facts. The barcode is the only value sent to its public API. */
export async function lookupBarcodeNutrition(barcode: string): Promise<BarcodeNutrition | null> {
  const normalizedBarcode = barcode.replace(/\D/g, '');
  if (normalizedBarcode.length < 8) return null;

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${normalizedBarcode}.json?fields=product_name,serving_size,servings_per_container,nutriments`,
    { headers: { 'User-Agent': 'Remaining/1.0 (local calorie tracker)' } },
  );
  if (!response.ok) throw new Error('Barcode lookup failed.');

  const payload = await response.json() as OpenFoodFactsResponse;
  if (payload.status !== 1 || !payload.product) return null;

  const { product_name: name, serving_size: servingSize, servings_per_container: servingsRaw, nutriments = {} } = payload.product;
  // `energy-kcal` alone is commonly the value per 100 g, so never present it as a serving.
  const directCalories = numericValue(nutriments['energy-kcal_serving']);
  const caloriesPer100g = numericValue(nutriments['energy-kcal_100g']);
  const calculatedCalories = caloriesPer100g && gramsInServing(servingSize)
    ? (caloriesPer100g * gramsInServing(servingSize)!) / 100
    : undefined;

  return {
    name: name?.trim() || undefined,
    caloriesPerServing: directCalories ?? calculatedCalories,
    servingSize: servingSize?.trim() || undefined,
    servingsPerContainer: numericValue(servingsRaw),
  };
}
