<script setup lang="ts">
import type { SpreadsheetColumn } from '@nuxt/ui'

type Product = {
  sku: string
  name: string
  category: string
  price: number | null
  stock: number | null
  available: boolean
}

const data = ref<Product[]>([
  { sku: 'KB-001', name: 'Mechanical keyboard', category: 'Accessories', price: 129, stock: 42, available: true },
  { sku: 'MS-014', name: 'Wireless mouse', category: 'Accessories', price: 59, stock: 128, available: true },
  { sku: 'MN-270', name: '27" monitor', category: 'Displays', price: 349, stock: 7, available: true },
  { sku: 'HD-090', name: 'Studio headphones', category: 'Audio', price: 199, stock: 0, available: false },
  { sku: 'WC-108', name: '4K webcam', category: 'Video', price: 149, stock: 23, available: true },
  { sku: 'DK-330', name: 'USB-C dock', category: 'Accessories', price: 229, stock: 15, available: true },
  { sku: 'MC-410', name: 'Condenser microphone', category: 'Audio', price: 119, stock: 31, available: true },
  { sku: 'LT-552', name: 'Desk lamp', category: 'Lighting', price: 79, stock: 64, available: false }
])

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: SpreadsheetColumn<Product>[] = [
  { key: 'sku', label: 'SKU', width: 96, editable: false },
  { key: 'name', label: 'Name', width: 200 },
  { key: 'category', label: 'Category', type: 'select', options: ['Accessories', 'Audio', 'Displays', 'Lighting', 'Video'], width: 140 },
  { key: 'price', label: 'Price', type: 'number', format: value => value == null ? '' : currency.format(value) },
  { key: 'stock', label: 'Stock', type: 'number', width: 96 },
  { key: 'available', label: 'Available', type: 'checkbox', width: 104 }
]
</script>

<template>
  <USpreadsheet v-model:data="data" :columns="columns" aria-label="Products" class="h-80 w-full" />
</template>
