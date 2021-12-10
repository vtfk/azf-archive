const repack = require('../lib/dsf/repackDsfObject')

const person = {
  FODT: '258151',
  PERS: '98053',
  INR: '25815100000',
  STAT: 'BOSATT',
  'NAVN-S': 'Tunnel',
  'NAVN-F': 'Offisiell',
  'NAVN-M': 'Bane',
  NAVN: 'Tunnel Offisiell Bane',
  ADR: 'Husøyveien 28',
  POSTN: '3132',
  POSTS: 'HUSØYSUND',
  ADR1: 'Husøygata',
  ADR2: '29',
  ADR3: '3133 HUSØYVIK',
  'SPES-KD': '0',
  SPES: 'VANLIG BOSATT',
  FNR: '25815198053',
  postAdresse: {
    ADR: 'Husøygata 29',
    POSTN: '3133',
    POSTS: 'HUSØYVIK'
  },
  bostedsAdresse: {
    ADR: 'Husøyveien 28',
    POSTN: '3132',
    POSTS: 'HUSØYSUND'
  }
}

const expectedProperties = [
  {
    name: 'ssn',
    type: 'string'
  },
  {
    name: 'firstName',
    type: 'string'
  },
  {
    name: 'lastName',
    type: 'string'
  },
  {
    name: 'streetAddress',
    type: 'string'
  },
  {
    name: 'zipCode',
    type: 'string'
  },
  {
    name: 'zipPlace',
    type: 'string'
  },
  {
    name: 'addressType',
    type: 'string'
  },
  {
    name: 'addressCode',
    type: 'number'
  }
]

test('Repack gives back an object with correct properties and layout', () => {
  const repacked = repack(person)
  expect(typeof repacked).toBe('object')
  expectedProperties.forEach(({ name, type }) => expect(typeof repacked[name]).toBe(type))
})
