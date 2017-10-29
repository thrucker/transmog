import nodeAssert from 'assert'

// eslint-disable-next-line import/no-mutable-exports
let assert

if (process.env.NODE_ENV === 'production') {
  assert = () => {}
} else {
  assert = nodeAssert
}

export default assert
