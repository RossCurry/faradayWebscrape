/**
 * Dont trust aI
 */
export function parseAndFormatOfferPrice(text: string | undefined | null) {
  if (!text) return null
  const match = text.match(/Precio de oferta:\s*([\d,.]+)\s*(?:Precio original:|\s*$)/s);

  if (match && match[1]) {
    let priceString = match[1].trim();

    // Replace comma with a dot for consistent float parsing in JavaScript
    priceString = priceString.replace(',', '.');

    // Parse to a float number
    const price = parseFloat(priceString);

    // Check if the parsed price is a valid number
    if (isNaN(price)) {
      return null; // Or throw an error, if the extracted string wasn't a valid number
    }

    // Format the number to two decimal places with a comma as the separator
    // 1. toFixed(2) returns a string with exactly two decimal places (e.g., "30.00", "15.50")
    // 2. replace('.', ',') replaces the period with a comma
    return price.toFixed(2).replace('.', ',');
  }

  // Return null if the offer price is not found
  return null;
}
