import defaults from 'lodash/defaults';
import flow from 'lodash/flow';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import identity from 'lodash/identity';
import invoke from 'lodash/invoke';
import isNil from 'lodash/isNil';
import mapValues from 'lodash/mapValues';
import omitBy from 'lodash/omitBy';
import pickBy from 'lodash/pickBy';
import tap from 'lodash/tap';

import assert from './assert';
import typeOf from './typeOf';

let canonicalizeBoolean = (transformProperty, destinationPath) => {
    if (!transformProperty) {
        return null;
    }

    return {
        converter: identity,
        sourcePath: destinationPath
    };
};

let canonicalizeFunction = (converter, destinationPath) => {
    return {converter, sourcePath: destinationPath};
}

let canonicalizeString = (sourcePath, destinationPath) => {
    return {converter: identity, sourcePath};
}

let canonicalizeObject = (rule, destinationPath) =>
    defaults(
        rule,
        {
            converter: identity,
            sourcePath: destinationPath
        },
    )

let canonicalizers = {
    'boolean': canonicalizeBoolean,
    'function': canonicalizeFunction,
    'string': canonicalizeString,
    'object': canonicalizeObject
};

let hasCanonicalizer = type =>
    has(canonicalizers, type)

let hasCanonicalizerForRule = flow(
    typeOf,
    hasCanonicalizer,
)

let filterExistingCanonicalizers = rules => pickBy(
    rules,
    hasCanonicalizerForRule,
);

let getCanonicalizerForRule = flow(
  typeOf,
  type => canonicalizers[type],
)

let applyCanonicalizerToRule = (rule, destinationPath) =>
    getCanonicalizerForRule(rule)(rule, destinationPath)

let applyCanonicalizers = rules => mapValues(
    rules,
    applyCanonicalizerToRule,
);

let omitEmptyRules = rules => omitBy(rules, isNil);

let assertFormatForRule = ({ converter, sourcePath }) => {
    assert(typeof converter === 'function', 'converter must be a function');
    assert(typeof sourcePath === 'string', 'sourcePath must be a string');
}

let assertFormatForRules = rules =>
    forEach(
        rules,
        assertFormatForRule,
    )

let assertRuleFormat = (rules) => tap(
    rules,
    assertFormatForRules,
);

export default flow(
    filterExistingCanonicalizers,
    applyCanonicalizers,
    omitEmptyRules,
    assertRuleFormat
);
