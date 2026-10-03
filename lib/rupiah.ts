/** Format angka jadi rupiah utuh — sama persis dengan gaya sheet Excel. */
export const rupiah = (value: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(value));
