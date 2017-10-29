import flow from 'lodash/flow'
import get from 'lodash/get'
import has from 'lodash/has'
import isNil from 'lodash/isNil'
import negate from 'lodash/negate'
import pickBy from 'lodash/pickBy'
import set from 'lodash/set'
import reduce from 'lodash/reduce'

import canonicalizeRules from './canonicalizeRules'

const or = (a, b) =>
  x => a(x) || b(x)

const isNotNil = negate(isNil)

const hasExistingValueAtPath = (path, obj) =>
  flow(
    x => get(x, path),
    isNotNil,
  )(obj)

const isRuleWithExistingSourceValue = obj =>
  flow(
    rule => rule.sourcePath,
    path => has(obj, path),
  )

const isRuleWithDefault = rule => has(rule, 'defaultTo')

const filterRulesForObject = obj => rules =>
  pickBy(
    rules,
    or(
      isRuleWithExistingSourceValue(obj),
      isRuleWithDefault,
    ),
  )

const convertValueFromSourcePath = (converter, sourcePath, obj) =>
  converter(get(obj, sourcePath), obj)

const convertValueOrUseDefault = ({ converter, sourcePath, defaultTo }, obj) => {
  if (hasExistingValueAtPath(sourcePath, obj) || !defaultTo) {
    return convertValueFromSourcePath(converter, sourcePath, obj)
  }
  return defaultTo(obj)
}

const applyRules = obj => rules =>
  reduce(
    rules,
    (acc, rule, destinationPath) =>
      set(
        acc,
        destinationPath,
        convertValueOrUseDefault(rule, obj),
      )
    ,
    {},
  )

export function createTransformer(rules) {
  const canonicalRules = canonicalizeRules(rules)
  return function transformer(obj) {
    return flow(
      filterRulesForObject(obj),
      applyRules(obj),
    )(canonicalRules)
  }
}

export default function serialize(rules, obj) {
  return createTransformer(rules)(obj)
}
