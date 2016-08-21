import _ from 'lodash/fp/placeholder';
import curry from 'lodash/fp/curry';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import has from 'lodash/fp/has';
import isNil from 'lodash/fp/isNil';
import negate from 'lodash/fp/negate';
import nthArg from 'lodash/fp/nthArg';
import pickBy from 'lodash/fp/pickBy';
import _reduce from 'lodash/fp/reduce';
import set from 'lodash/fp/set';
import tap from 'lodash/fp/tap';

import canonicalizeRules from './canonicalizeRules';

let reduce = _reduce.convert({cap: false});

export default curry(function serialize(rules, obj) {
    return flow(
        canonicalizeRules,
        filterRulesForObject(obj),
        applyRules(obj)
    )(rules);
});

let or = (a, b) =>
    (x) => a(x) || b(x)

let hasExistingValueAtPath = curry((path, obj) =>
    flow(
        get(path),
        negate(isNil)
    )(obj)
);

let isRuleWithExistingSourceValue = (obj) =>
    flow(
        get('sourcePath'),
        hasExistingValueAtPath(_, obj)
    );

let isRuleWithDefault = has('defaultTo');

let filterRulesForObject = curry((obj, rules) =>
    pickBy(
        or(
            isRuleWithExistingSourceValue(obj),
            isRuleWithDefault
        ),
        rules
    )
);

let convertValueFromSourcePath = (converter, sourcePath, obj) =>
    converter(get(sourcePath, obj), obj);

let convertValueOrUseDefault = ({converter, sourcePath, defaultTo}, obj) => {
    if (hasExistingValueAtPath(sourcePath, obj)) {
        return convertValueFromSourcePath(converter, sourcePath, obj);
    } else {
        return defaultTo(obj);
    }
};

let applyRules = curry((obj, rules) =>
    reduce(
        (acc, rule, destinationPath) =>
            set(
                destinationPath,
                convertValueOrUseDefault(rule, obj),
                acc
            )
        ,
        {},
        rules
    )
);
