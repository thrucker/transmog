import node_assert from 'assert';

var assert;

if (process.env.NODE_ENV === 'production') {
    assert = function assert() {
    }
} else {
    assert = node_assert;
}

export default assert;
