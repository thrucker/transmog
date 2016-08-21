import _ from 'lodash/fp/placeholder';
import curry from 'lodash/fp/curry';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import has from 'lodash/fp/has';
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
        filterRulesWithExistingSourcePath(obj),
        applyRules(obj)
    )(rules);
});

let filterRulesWithExistingSourcePath = curry((obj, rules) =>
    pickBy(
        flow(
            get('sourcePath'),
            has(_, obj)
        ),
        rules
    )
);

let convertValueFromSourcePath = (converter, sourcePath, obj) =>
    converter(get(sourcePath, obj));

let applyRules = curry((obj, rules) =>
    reduce(
        (acc, {converter, sourcePath}, destinationPath) =>
            set(
                destinationPath,
                convertValueFromSourcePath(converter, sourcePath, obj),
                acc
            )
        ,
        {},
        rules
    )
);
