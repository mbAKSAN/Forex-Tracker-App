import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import TrackerPage from '../src/pages/TrackerPage.vue'

// Forex store'u mock'la
const mockForexStore = {
  currencies: { USDTRY: 30.5, EURTRY: 33.2, GBPTRY: 38.1 },
  isLoading: false,
  error: null,
  fetchCurrencies: vi.fn(),
  connectWebSocket: vi.fn(),
  disconnectWebSocket: vi.fn()
}

// Store'u mock'la (Pinia kullanıyorsanız)
vi.mock('@/store/forexStore', () => ({
  useForexStore: () => mockForexStore
}))

// WebSocket servisini mock'la
vi.mock('@/services/websocket-service', () => ({
  connectWebSocket: vi.fn(),
  disconnectWebSocket: vi.fn()
}))

describe('TrackerPage.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render page title', () => {
    wrapper = mount(TrackerPage)
    
    expect(wrapper.find('h1').text()).toContain('Forex Tracker')
    // veya
    expect(wrapper.text()).toContain('Currency Rates')
  })

  it('should display forex rates when loaded', () => {
    wrapper = mount(TrackerPage, {
      global: {
        mocks: {
          $store: mockForexStore
        }
      }
    })

    expect(wrapper.text()).toContain('30.5')
    expect(wrapper.text()).toContain('33.2')
    expect(wrapper.text()).toContain('38.1')
  })

  it('should show loading state', async () => {
    const loadingStore = { 
      ...mockForexStore, 
      isLoading: true,
      currencies: {}
    }

    wrapper = mount(TrackerPage, {
      global: {
        mocks: {
          $store: loadingStore
        }
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    // veya
    expect(wrapper.text()).toContain('Loading')
  })

  it('should handle error state', async () => {
    const errorStore = { 
      ...mockForexStore, 
      error: 'Connection failed',
      isLoading: false
    }

    wrapper = mount(TrackerPage, {
      global: {
        mocks: {
          $store: errorStore
        }
      }
    })

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Connection failed')
  })

  it('should refresh rates when button clicked', async () => {
    wrapper = mount(TrackerPage, {
      global: {
        mocks: {
          $store: mockForexStore
        }
      }
    })

    const refreshButton = wrapper.find('[data-testid="refresh-button"]')
    await refreshButton.trigger('click')

    expect(mockForexStore.fetchCurrencies).toHaveBeenCalled()
  })

  it('should format currency values correctly', () => {
    wrapper = mount(TrackerPage, {
      global: {
        mocks: {
          $store: mockForexStore
        }
      }
    })

    // Currency formatting test
    const currencyElements = wrapper.findAll('.currency-rate')
    expect(currencyElements.length).toBeGreaterThan(0)
    
    // İlk currency rate'in formatını kontrol et
    expect(currencyElements[0].text()).toMatch(/\d+\.\d{2,}/)
  })

  it('should connect to websocket on mount', () => {
    wrapper = mount(TrackerPage)
    
    expect(mockForexStore.connectWebSocket).toHaveBeenCalled()
  })

  it('should disconnect websocket on unmount', () => {
    wrapper = mount(TrackerPage)
    wrapper.unmount()
    
    expect(mockForexStore.disconnectWebSocket).toHaveBeenCalled()
  })
})