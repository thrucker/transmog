import { expect } from 'chai'

function requireNoCache(module) {
  delete require.cache[require.resolve(module)]
  // eslint-disable-next-line import/no-dynamic-require,global-require
  return require(module)
}

describe('assert', () => {
  context('production environment', () => {
    let assert = null
    let oldNodeEnv = null

    before(() => {
      oldNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      assert = requireNoCache('../src/assert')
    })

    after(() => {
      process.env.NODE_ENV = oldNodeEnv
    })

    it('should not throw on successful assertion', () => {
      expect(() => assert(true, 'should pass')).to.not.throw()
    })

    it('should not throw on failed assertion', () => {
      expect(() => assert(false, 'should fail')).to.not.throw()
    })
  })

  context('non-production environment', () => {
    let assert = null
    let oldNodeEnv = null

    before(() => {
      oldNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      assert = requireNoCache('../src/assert')
    })

    after(() => {
      process.env.NODE_ENV = oldNodeEnv
    })

    it('should not throw on successful assertion', () => {
      expect(() => assert(true, 'should pass')).to.not.throw()
    })

    it('should throw on failed assertion', () => {
      expect(() => assert(false, 'should fail')).to.throw()
    })
  })
})
