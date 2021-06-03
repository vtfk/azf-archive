const repackResult = require('../lib/repack-result')

const resultPrivatePerson = repackResult({
  ErrorDetails: null,
  ErrorMessage: null,
  PrivatePersons: [
    {
      Recno: 123456,
      FirstName: 'Roger',
      MiddleName: null,
      LastName: 'Hestefjes',
      PersonalIdNumber: '01010101010',
      ExternalID: '01010101010',
      PhoneNumber: null,
      MobilePhone: null,
      Email: null,
      Gender: null,
      Categories: [],
      CustomNo1: '',
      CustomNo2: '',
      CustomNo3: '',
      Active: true,
      CreatedDate: '2020-05-15T11:37:38',
      ModifiedDate: '2021-05-20T14:38:46',
      Title: '',
      AccessGroup: '',
      AdditionalFields: null,
      AlternativeEmail: null
    }
  ],
  Successful: true,
  TotalCount: 1,
  TotalPageCount: 1
})

const resultCreateCase = repackResult({
  ErrorDetails: null,
  ErrorMessage: null,
  Recno: 123456,
  CaseNumber: '40/12345',
  Successful: true,
  TotalCount: 1,
  TotalPageCount: 1
})

test('PrivatePerson result is Array', () => {
  expect(Array.isArray(resultPrivatePerson)).toBe(true)
})

test('PrivatePerson result has one item only', () => {
  expect(Object.getOwnPropertyNames(resultPrivatePerson)).toStrictEqual(['0', 'length'])
})

test('PrivatePerson results one item has a "Recno" property', () => {
  expect(resultPrivatePerson[0].Recno).toBe(123456)
})

test('CreateCase result is Array', () => {
  expect(Array.isArray(resultCreateCase)).toBe(true)
})

test('CreateCase result has one item only', () => {
  expect(Object.getOwnPropertyNames(resultCreateCase)).toStrictEqual(['0', 'length'])
})

test('CreateCase results one item has a "Recno" and a "CaseNumber" property', () => {
  expect(resultCreateCase[0].Recno).toBe(123456)
  expect(resultCreateCase[0].CaseNumber).toBe('40/12345')
})
