export const CATEGORIES = [
  { value: 'gaming', label: 'เกมมิ่ง' },
  { value: 'office', label: 'ทำงานออฟฟิศ' },
  { value: 'general', label: 'เรียน-ทำงานทั่วไป' },
  { value: 'creator', label: 'สตรีมมิ่ง/สร้างคอนเทนต์' },
];

export function getCategoryLabel(value) {
  return CATEGORIES.find((category) => category.value === value)?.label || value;
}
