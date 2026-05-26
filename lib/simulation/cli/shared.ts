export function shortIf(name: string, brand: string): string {
  if (brand === 'Huawei')   return name.replace('GigabitEthernet', 'GE')
  if (brand === 'Juniper')  return name
  if (brand === 'MikroTik') return name
  return name.replace('GigabitEthernet', 'Gi').replace('FastEthernet', 'Fa')
}
