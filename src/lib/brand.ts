export const brand = {
  name: "Optima Kemasan Prima",
};

/** The phone number and default message come from admin settings (see settings.ts). */
export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
