const { dependencies, devDependencies } = require('../package.json')

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

if (Object.keys(devDependencies).length > 0) {
  Object.keys(devDependencies).forEach((dependency) => {
    test(`Dev dependency '${dependency}' loads ok`, () => {
      const module = require(dependency)
      expect(module).toBeTruthy()
    })
  })
} else {
  test('no devDependecies to test', () => {
    expect(typeof '').toBe('string') // test is needed if no devDependencies exists
  })
}
