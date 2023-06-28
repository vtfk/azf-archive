const { dependencies } = require('../package.json')

if (Object.keys(dependencies).length > 0) {
  Object.keys(dependencies).forEach((dependency) => {
    test(`Dependency '${dependency}' loads ok`, () => {
      const module = require(dependency)
      expect(module).toBeTruthy()
    })
  })
} else {
  test('no dependecies to test', () => {
    expect(typeof '').toBe('string') // test is needed if no dependencies exists
  })
}
