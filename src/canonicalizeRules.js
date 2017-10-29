import defaults from 'lodash/defaults'
import flow from 'lodash/flow'
import forEach from 'lodash/forEach'
import has from 'lodash/has'
import identity from 'lodash/identity'
import isNil from 'lodash/isNil'
import mapValues from 'lodash/mapValues'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'
import tap from 'lodash/tap'

import assert from './assert'
import typeOf from './typeOf'

const canonicalizeBoolean = (transformProperty, destinationPath) => {
  if (!transformProperty) {
    return null
  }

  return {
    converter: identity,
    sourcePath: destinationPath,
  }
}

const canonicalizeFunction = (converter, destinationPath) => ({
  converter,
  sourcePath: destinationPath,
})

const canonicalizeString = sourcePath => ({ converter: identity, sourcePath })

const canonicalizeObject = (rule, destinationPath) =>
  defaults(
    rule,
    {
      converter: identity,
      sourcePath: destinationPath,
    },
  )

const canonicalizers = {
  boolean: canonicalizeBoolean,
  function: canonicalizeFunction,
  string: canonicalizeString,
  object: canonicalizeObject,
}

const hasCanonicalizer = type =>
  has(canonicalizers, type)

const hasCanonicalizerForRule = flow(
  typeOf,
  hasCanonicalizer,
)

const filterExistingCanonicalizers = rules => pickBy(
  rules,
  hasCanonicalizerForRule,
)

const getCanonicalizerForRule = flow(
  typeOf,
  type => canonicalizers[type],
)

const applyCanonicalizerToRule = (rule, destinationPath) =>
  getCanonicalizerForRule(rule)(rule, destinationPath)

const applyCanonicalizers = rules => mapValues(
  rules,
  applyCanonicalizerToRule,
)

const omitEmptyRules = rules => omitBy(rules, isNil)

const assertFormatForRule = ({ converter, sourcePath }) => {
  assert(typeof converter === 'function', 'converter must be a function')
  assert(typeof sourcePath === 'string', 'sourcePath must be a string')
}

const assertFormatForRules = rules =>
  forEach(
    rules,
    assertFormatForRule,
  )

const assertRuleFormat = rules => tap(
  rules,
  assertFormatForRules,
)

export default flow(
  filterExistingCanonicalizers,
  applyCanonicalizers,
  omitEmptyRules,
  assertRuleFormat,
)
