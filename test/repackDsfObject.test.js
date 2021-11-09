const repack = require('../lib/dsf/repackDsfObject')

const person = {
  FODT: '258151',
  PERS: '98053',
  INR: '25815100000',
  STAT: 'BOSATT',
  'NAVN-S': 'TUNNEL',
  'NAVN-F': 'OFFISIELL',
  'NAVN-M': 'BANE',
  NAVN: 'TUNNEL OFFISIELL BANE',
  ADR: 'HUSØYVEIEN 28',
  POSTN: '3132',
  POSTS: 'HUSØYSUND',
  'SPES-KD': '0',
  SPES: 'VANLIG BOSATT'
}

const personOn4 = {
  ...person,
  'SPES-KD': '4',
  SPES: 'KLIENTADRESSE'
}

const personOn6 = {
  ...person,
  'SPES-KD': '6',
  SPES: 'SPERRET ADRESSE, STRENGT FORTROLIG'
}

const personOn7 = {
  ...person,
  'SPES-KD': '7',
  SPES: 'SPERRET ADRESSE, FORTROLIG'
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

test('SPES-KD 0 returns object with real streetAddress', () => {
  const repacked = repack(person)
  expect(repacked.streetAddress.toLowerCase()).toBe(person.ADR.toLowerCase())
  expect(repacked.zipCode).toBe(person.POSTN)
  expect(repacked.zipPlace.toLowerCase()).toBe(person.POSTS.toLowerCase())
  expect(repacked.addressType).toBe('normal')
})

test('SPES-KD 4 returns object without real streetAddress', () => {
  const repacked = repack(personOn4)
  expect(repacked.streetAddress).toBe('Klientadresse')
  expect(repacked.zipCode).toBe('_9999')
  expect(repacked.zipPlace).toBe('UKJENT')
  expect(repacked.addressType).toBe('klientadresse')
})

test('SPES-KD 6 returns object without real streetAddress', () => {
  const repacked = repack(personOn6)
  expect(repacked.streetAddress.toLowerCase()).toBe(personOn6.SPES.toLowerCase())
  expect(repacked.zipCode).toBe('_9999')
  expect(repacked.zipPlace).toBe('UKJENT')
  expect(repacked.addressType).toBe('Sperret adresse, strengt fortrolig')
})

test('SPES-KD 7 returns object without real streetAddress', () => {
  const repacked = repack(personOn7)
  expect(repacked.streetAddress.toLowerCase()).toBe(personOn7.SPES.toLowerCase())
  expect(repacked.zipCode).toBe('_9999')
  expect(repacked.zipPlace).toBe('UKJENT')
  expect(repacked.addressType).toBe('Sperret adresse, fortrolig')
})
