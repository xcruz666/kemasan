export const brand = {
  name: "Optima Kemasan Prima",
  phone: "628122220195",
  displayPhone: "0812-2220-195",
  phoneInternational: "+628122220195",
};

export function whatsappUrl(
  message = `Halo ${brand.name}, saya ingin konsultasi dan mendapatkan penawaran kantong vacuum untuk usaha saya.`,
) {
  return `https://wa.me/${brand.phone}?text=${encodeURIComponent(message)}`;
}
