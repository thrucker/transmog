import flow from 'lodash/flow';
import get from 'lodash/get';
import has from 'lodash/has';
import isNil from 'lodash/isNil';
import negate from 'lodash/negate';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';
import reduce from 'lodash/reduce';

import canonicalizeRules from './canonicalizeRules';

export default function serialize(rules, obj) {
    return flow(
        canonicalizeRules,
        filterRulesForObject(obj),
        applyRules(obj)
    )(rules);
};

let or = (a, b) =>
    x => a(x) || b(x)

let isNotNil = negate(isNil)

let hasExistingValueAtPath = (path, obj) =>
    flow(
        x => get(x, path),
        isNotNil,
    )(obj);

let isRuleWithExistingSourceValue = (obj) =>
    flow(
        rule => rule.sourcePath,
        path => has(obj, path),
    );

let isRuleWithDefault = rule => has(rule, 'defaultTo');

let filterRulesForObject = obj => rules =>
    pickBy(
        rules,
        or(
            isRuleWithExistingSourceValue(obj),
            isRuleWithDefault
        ),
    );

let convertValueFromSourcePath = (converter, sourcePath, obj) =>
    converter(get(obj, sourcePath), obj);

let convertValueOrUseDefault = ({converter, sourcePath, defaultTo}, obj) => {
    if (hasExistingValueAtPath(sourcePath, obj) || !defaultTo) {
        return convertValueFromSourcePath(converter, sourcePath, obj);
    } else {
        return defaultTo(obj);
    }
};

let applyRules = obj => rules =>
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
    );
