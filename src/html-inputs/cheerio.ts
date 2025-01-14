import cheerio from 'cheerio'
import fs from 'fs-extra'
import path from 'path'
import { isString } from '../helpers'

export const loadHtml = (filePath: string) => {
  const htmlCode = fs.readFileSync(filePath, 'utf8')
  const $ = cheerio.load(htmlCode)

  return Object.assign($, { filePath })
}

export const getRelativePath = (filePath: string) => (
  p: string,
) => {
  const fileDir = path.dirname(filePath)
  const relDir = path.relative(process.cwd(), fileDir)

  return path.join(relDir, p)
}

/* -------------------- SCRIPTS -------------------- */

export const getScriptElems = ($: CheerioStatic) =>
  $('script')
    .not('[data-rollup-asset]')
    .not('[src^="http:"]')
    .not('[src^="https:"]')
    .not('[src^="data:"]')
    .not('[src^="/"]')

// Mutative action
export const mutateScriptElems = (
  $: CheerioStatic & {
    filePath: string
  },
) => {
  getScriptElems($)
    .attr('type', 'module')
    .attr('src', (i, value) => {
      // FIXME: @types/cheerio is wrong for AttrFunction: index.d.ts, line 16
      // declare type AttrFunction = (i: number, currentValue: string) => any;
      // eslint-disable-next-line
      // @ts-ignore
      const replaced = value.replace(/\.[jt]sx?/g, '.js')

      return replaced
    })

  return $
}

export const getScripts = ($: CheerioStatic) =>
  getScriptElems($).toArray()

export const getScriptSrc = (
  $: CheerioStatic & {
    filePath: string
  },
) =>
  getScripts($)
    .map((elem) => $(elem).attr('src'))
    .filter(isString)
    .map(getRelativePath($.filePath))

/* ----------------- ASSET SCRIPTS ----------------- */

const getAssets = ($: CheerioStatic) =>
  $('script')
    .filter('[data-rollup-asset="true"]')
    .not('[src^="http:"]')
    .not('[src^="https:"]')
    .not('[src^="data:"]')
    .not('[src^="/"]')
    .toArray()

export const getJsAssets = (
  $: CheerioStatic & {
    filePath: string
  },
) =>
  getAssets($)
    .map((elem) => $(elem).attr('src'))
    .filter(isString)
    .map(getRelativePath($.filePath))

/* -------------------- css ------------------- */

const getCss = ($: CheerioStatic) =>
  $('link')
    .filter('[rel="stylesheet"]')
    .not('[href^="http:"]')
    .not('[href^="https:"]')
    .not('[href^="data:"]')
    .not('[href^="/"]')
    .toArray()

export const getCssHrefs = (
  $: CheerioStatic & {
    filePath: string
  },
) =>
  getCss($)
    .map((elem) => $(elem).attr('href'))
    .filter(isString)
    .map(getRelativePath($.filePath))

/* -------------------- img ------------------- */

const getImgs = ($: CheerioStatic) =>
  $('img')
    .not('[src^="http://"]')
    .not('[src^="https://"]')
    .not('[src^="data:"]')
    .not('[src^="/"]')
    .toArray()

const getFavicons = ($: CheerioStatic) =>
  $('link[rel="icon"]')
    .not('[href^="http:"]')
    .not('[href^="https:"]')
    .not('[href^="data:"]')
    .not('[href^="/"]')
    .toArray()

export const getImgSrcs = (
  $: CheerioStatic & {
    filePath: string
  },
) => {
  return [
    ...getImgs($).map((elem) => $(elem).attr('src')),
    ...getFavicons($).map((elem) => $(elem).attr('href')),
  ]
    .filter(isString)
    .map(getRelativePath($.filePath))
}
