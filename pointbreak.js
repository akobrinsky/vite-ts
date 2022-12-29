import json2mq from 'json2mq'
import { ref, inject } from 'vue'

export const TAILWIND_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
}

const convertBreakpointsToMediaQueries = (breakpoints) => {
  const breakpointLabels = Object.keys(breakpoints)
  const breakpointValues = Object.values(breakpoints)
  /*
  *  javascript media queries look quite similar to css
  *  this reduce creates these media queries with the min being the breakpoint
  *  and the max being the next breakpoint - 1
  *  i.e. (min-width: 640px) and (max-width: 767px)
  *  the last xxl breakpoint should only have a min-width
  */
  const mediaQueries = breakpointValues.reduce((convertedBreakpoints, value, idx) => {
    const options = {
      minWidth: value,
    }
    const { length } = breakpointLabels
    if (idx < length - 1) options.maxWidth = breakpointValues[idx + 1] - 1
    const mediaQuery = json2mq(options)
    convertedBreakpoints[breakpointLabels[idx]] = mediaQuery
    return convertedBreakpoints
  }, {})
  return mediaQueries
}

const addListenersToMediaQueries = (mediaQuery, updateBreakpoint) => {
  const mq = window.matchMedia(mediaQuery)
  const callback = (e) => {
    if (e.matches) updateBreakpoint()
  }
  mq.addEventListener('change', callback)
  callback(mq)
}
const pointbreak = (app) => {
  let initialized = false
  const pointbreak = ref(null)
  app.config.unwrapInjectedRef = true
  app.provide('pointbreak', pointbreak)

  if (!initialized) {
    const mediaQueries = convertBreakpointsToMediaQueries(TAILWIND_BREAKPOINTS)
    for (const [breakpoint, mq] of Object.entries(mediaQueries)) {
      const updateCurrentBreakpoint = () => {
        pointbreak.value = breakpoint
      }
      addListenersToMediaQueries(mq, updateCurrentBreakpoint)
    }
    initialized = true
  }
}

export const usePointbreak = () => inject('pointbreak')
export default pointbreak
