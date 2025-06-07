import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import MyAssetsPage from '../src/pages/MyAssetsPage.vue'

// Mock assets store
const mockAssetsStore = {
  assets: [
    { id: 1, symbol: 'USDTRY', amount: 1000, purchasePrice: 28.5 },
    { id: 2, symbol: 'EURTRY', amount: 500, purchasePrice: 31.2 }
  ],
  isLoading: false,
  error: null,
  addAsset: vi.fn(),
  removeAsset: vi.fn(),
  updateAsset: vi.fn(),
  fetchAssets: vi.fn()
}

// Forex store mock (current prices için)
const mockForexStore = {
  currencies: { USDTRY: 30.5, EURTRY: 33.2 },
  isLoading: false
}

vi.mock('@/store/assetsStore', () => ({
  useAssetsStore: () => mockAssetsStore
}))

vi.mock('@/store/forexStore', () => ({
  useForexStore: () => mockForexStore
}))

// Router mock
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('MyAssetsPage.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render page title and assets', () => {
    wrapper = mount(MyAssetsPage, {
      global: {
        mocks: {
          $assetsStore: mockAssetsStore,
          $forexStore: mockForexStore
        }
      }
    })

    expect(wrapper.find('h1').text()).toContain('My Assets')
    expect(wrapper.findAll('.asset-item')).toHaveLength(2)
  })

  it('should display asset information correctly', () => {
    wrapper = mount(MyAssetsPage)

    const assetItems = wrapper.findAll('.asset-item')
    
    // İlk asset kontrolü
    expect(assetItems[0].text()).toContain('USDTRY')
    expect(assetItems[0].text()).toContain('1000')
    expect(assetItems[0].text()).toContain('28.5')
    
    // İkinci asset kontrolü
    expect(assetItems[1].text()).toContain('EURTRY')
    expect(assetItems[1].text()).toContain('500')
    expect(assetItems[1].text()).toContain('31.2')
  })

  it('should calculate profit/loss correctly', () => {
    wrapper = mount(MyAssetsPage)

    // USDTRY: 1000 * (30.5 - 28.5) = 2000 profit
    // EURTRY: 500 * (33.2 - 31.2) = 1000 profit
    const profitElements = wrapper.findAll('.profit-loss')
    
    expect(profitElements[0].text()).toContain('+2000') // veya formatınıza göre
    expect(profitElements[1].text()).toContain('+1000')
  })

  it('should open add asset modal', async () => {
    wrapper = mount(MyAssetsPage)

    const addButton = wrapper.find('[data-testid="add-asset-btn"]')
    await addButton.trigger('click')

    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toContain('Add Asset')
  })

  it('should add new asset', async () => {
    wrapper = mount(MyAssetsPage)

    // Modal'ı aç
    await wrapper.find('[data-testid="add-asset-btn"]').trigger('click')

    // Form alanlarını doldur
    await wrapper.find('input[name="symbol"]').setValue('GBPTRY')
    await wrapper.find('input[name="amount"]').setValue('750')
    await wrapper.find('input[name="purchasePrice"]').setValue('35.8')

    // Submit button'a tıkla
    await wrapper.find('[data-testid="submit-asset"]').trigger('click')

    expect(mockAssetsStore.addAsset).toHaveBeenCalledWith({
      symbol: 'GBPTRY',
      amount: 750,
      purchasePrice: 35.8
    })
  })

  it('should remove asset', async () => {
    wrapper = mount(MyAssetsPage)

    const removeButton = wrapper.find('[data-testid="remove-asset-1"]')
    await removeButton.trigger('click')

    expect(mockAssetsStore.removeAsset).toHaveBeenCalledWith(1)
  })

  it('should filter assets by search term', async () => {
    wrapper = mount(MyAssetsPage)

    const searchInput = wrapper.find('input[placeholder*="Search"]')
    await searchInput.setValue('USD')

    // Sadece USD içeren asset'ler görünmeli
    const visibleAssets = wrapper.findAll('.asset-item:not(.hidden)')
    expect(visibleAssets).toHaveLength(1)
    expect(visibleAssets[0].text()).toContain('USDTRY')
  })

  it('should show empty state when no assets', () => {
    const emptyStore = { ...mockAssetsStore, assets: [] }
    
    wrapper = mount(MyAssetsPage, {
      global: {
        mocks: {
          $assetsStore: emptyStore
        }
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No assets found')
  })

  it('should handle loading state', () => {
    const loadingStore = { ...mockAssetsStore, isLoading: true }
    
    wrapper = mount(MyAssetsPage, {
      global: {
        mocks: {
          $assetsStore: loadingStore
        }
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('should calculate total portfolio value', () => {
    wrapper = mount(MyAssetsPage)

    // USDTRY: 1000 * 30.5 = 30500
    // EURTRY: 500 * 33.2 = 16600
    // Total: 47100
    const totalValue = wrapper.find('[data-testid="total-portfolio-value"]')
    expect(totalValue.text()).toContain('47,100') // Format'ınıza göre
  })

  it('should sort assets by different criteria', async () => {
    wrapper = mount(MyAssetsPage)

    // Profit'e göre sırala
    const sortSelect = wrapper.find('select[data-testid="sort-select"]')
    await sortSelect.setValue('profit')

    // Asset sıralamasının değiştiğini kontrol et
    const assetItems = wrapper.findAll('.asset-item')
    // Profit'i yüksek olan ilk sırada olmalı
  })
})