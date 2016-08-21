import _ from 'lodash/fp/placeholder';
import defaults from 'lodash/fp/defaults';
import flow from 'lodash/fp/flow';
import forEach from 'lodash/fp/forEach';
import has from 'lodash/fp/has';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/invoke';
import isNil from 'lodash/fp/isNil';
import _mapValues from 'lodash/fp/mapValues';
import omitBy from 'lodash/fp/omitBy';
import pickBy from 'lodash/fp/pickBy';
import tap from 'lodash/fp/tap';

import assert from './assert';
import typeOf from './typeOf';

let mapValues = _mapValues.convert({cap: false});

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
        {
            converter: identity,
            sourcePath: destinationPath
        },
        rule
    )

let canonicalizers = {
    'boolean': canonicalizeBoolean,
    'function': canonicalizeFunction,
    'string': canonicalizeString,
    'object': canonicalizeObject
};

let filterExistingCanonicalizers = pickBy(
    flow(typeOf, has(_, canonicalizers))
);

let applyCanonicalizers = mapValues(
    (rule, destinationPath) => invoke(canonicalizers, typeOf(rule), rule, destinationPath)
);

let omitEmptyRules = omitBy(isNil);

let assertRuleFormat = tap(
    forEach(({converter, sourcePath}) => {
        assert(typeof converter === 'function', 'converter must be a function');
        assert(typeof sourcePath === 'string', 'sourcePath must be a string');
    })
);

export default flow(
    filterExistingCanonicalizers,
    applyCanonicalizers,
    omitEmptyRules,
    assertRuleFormat
);
