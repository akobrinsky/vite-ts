/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import pointbreak, { TAILWIND_BREAKPOINTS, usePointbreak } from './pointbreak'

const baseComponent = {
  created () {
    if (this.pointbreak) this.dummyMethod('from created')
  },
  mounted () {
    if (this.pointbreak) this.dummyMethod('from mounted')
  },
  methods: {
    dummyMethod (val) {
      return 'HUZZAH!!!'
    },
  },
  template: '<div />',
}

const optionsApiComponent = defineComponent({
  ...baseComponent,
  inject: ['pointbreak'],
})

const compApiComponent = defineComponent({
  ...baseComponent,
  setup: () => ({ pointbreak: usePointbreak() }),
})

const setup = (compApi = false) =>
  mount(compApi ? compApiComponent : optionsApiComponent, {
    global: {
      plugins: [pointbreak],
    },
  })

describe('pointbreak', () => {
  for (const [key, value] of Object.entries(TAILWIND_BREAKPOINTS)) {
    it(`Picks the ${key} breakpoint`, async () => {
      window.resizeTo(value || 500)
      const { vm } = setup()
      expect(vm.pointbreak).toBe(key)
    })
  }

  it('Returns null if the width is invalid', async () => {
    window.resizeTo(-100)
    const dummyMethodSpy = vi.spyOn(optionsApiComponent.methods, 'dummyMethod')
    const { vm } = setup()
    expect(dummyMethodSpy).not.toHaveBeenCalled()
    expect(dummyMethodSpy).not.toHaveBeenCalled()
    expect(vm.pointbreak).toBe(null)
  })

  const assertDummyMethods = (spy) => {
    expect(spy).toHaveBeenCalledWith('from created')
    expect(spy).toHaveBeenCalledWith('from mounted')
    expect(spy.mock.results.length).toBe(2)
    expect(spy.mock.results[0].value).toBe('HUZZAH!!!')
  }

  it('it is available in both mounted and created lifecycle hooks', async () => {
    window.resizeTo(1000)
    const optionsApiMethodsSpy = vi.spyOn(
      optionsApiComponent.methods,
      'dummyMethod',
    )
    const { vm } = setup()
    expect(vm.pointbreak).toBeDefined()
    expect(optionsApiComponent.inject).toEqual(['pointbreak'])
    expect(optionsApiComponent.setup).toBeUndefined()
    assertDummyMethods(optionsApiMethodsSpy)
  })
  it('it is available in setup with composition api by using usePointbreak', async () => {
    const compositionApiMethodsSpy = vi.spyOn(
      compApiComponent.methods,
      'dummyMethod',
    )
    const { vm } = setup(true)
    expect(vm.pointbreak).toBeDefined()
    expect(compApiComponent.setup).toBeDefined()
    expect(compApiComponent.inject).toBeUndefined()
    assertDummyMethods(compositionApiMethodsSpy)
  })
})
