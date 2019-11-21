import { join } from 'path'
import { InputOptions } from 'rollup'
import { context } from '../../../__fixtures__/minimal-plugin-context'
import {
  getExtPath,
  getRelative,
} from '../../../__fixtures__/utils'
import htmlInputs, { HtmlInputsPluginCache } from '../index'

const cheerio = require('../cheerio')

const srcDir = join(
  process.cwd(),
  '__fixtures__/extensions/basic',
)
const cache: HtmlInputsPluginCache = {
  css: [],
  html: [],
  img: [],
  input: [],
  js: [],
  scripts: [],
}

const plugin = htmlInputs({ srcDir }, cache)

// Html files
const optionsHtml = getExtPath('basic/options.html')
const popupHtml = getExtPath('basic/popup.html')

// Html scripts
const optionsJs = getExtPath('basic/options1.js')
const optionsJsx = getExtPath('basic/options2.jsx')
const optionsTs = getExtPath('basic/options3.ts')
const optionsTsx = getExtPath('basic/options4.tsx')
const popupJs = getExtPath('basic/popup.js')

// Html assets
const optionsCss = getExtPath('basic/options.css')
const optionsPng = getExtPath('basic/options.png')
const optionsJpg = getExtPath('basic/options.jpg')
const assetJs = getExtPath('basic/asset.js')

// External script file
const backgroundJs = getExtPath('basic/background.js')

let options: InputOptions
beforeEach(() => {
  options = {
    input: [optionsHtml, popupHtml, backgroundJs],
  } as InputOptions

  cache.css = []
  cache.html = []
  cache.img = []
  cache.input = []
  cache.js = []
  cache.scripts = []
})

test('returns options.input as input record', () => {
  const result = plugin.options.call(context, options)

  expect(result).toMatchObject({
    input: {
      options1: '__fixtures__/extensions/basic/options1.js',
      options2: '__fixtures__/extensions/basic/options2.jsx',
      options3: '__fixtures__/extensions/basic/options3.ts',
      options4: '__fixtures__/extensions/basic/options4.tsx',
      popup: '__fixtures__/extensions/basic/popup.js',
      // External script paths won't be touched
      background: backgroundJs,
    },
  })
})

test('calls loadHtml', () => {
  const spy = jest.spyOn(cheerio, 'loadHtml')

  plugin.options.call(context, options)

  expect(spy).toBeCalledTimes(2)
  expect(spy).toBeCalledWith(optionsHtml, 0, [
    optionsHtml,
    popupHtml,
  ])
  expect(spy).toBeCalledWith(popupHtml, 1, [
    optionsHtml,
    popupHtml,
  ])
})

test('caches correct inputs & assets', () => {
  // Cache should be empty before hook
  expect(cache.css).toEqual([])
  expect(cache.html).toEqual([])
  expect(cache.img).toEqual([])
  expect(cache.js).toEqual([])
  expect(cache.scripts).toEqual([])
  expect(cache.input).toEqual([])

  plugin.options.call(context, options)

  // js, jsx, ts, tsx
  expect(cache.js).toEqual(
    [optionsJs, optionsJsx, optionsTs, optionsTsx, popupJs].map(
      getRelative,
    ),
  )
  // cached options.input
  expect(cache.input).toEqual([
    backgroundJs,
    ...[
      optionsJs,
      optionsJsx,
      optionsTs,
      optionsTsx,
      popupJs,
    ].map(getRelative),
  ])
  // Assets to emit
  expect(cache.css).toEqual([optionsCss].map(getRelative))
  expect(cache.html).toEqual([optionsHtml, popupHtml])
  expect(cache.img).toEqual(
    [optionsPng, optionsJpg].map(getRelative),
  )
  // non-bundled js
  expect(cache.scripts).toEqual([assetJs].map(getRelative))
})

test('if cache.input exists, do nothing', () => {
  cache.input = [optionsJs]

  const result = plugin.options.call(context, options)

  expect(result).toBe(options)
})

test('if no input has no html, do nothing', () => {
  const options = { input: [optionsJs] }

  const result = plugin.options.call(context, options)

  expect(result).toBe(options)
})
