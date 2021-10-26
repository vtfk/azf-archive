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

const resultCreateCaseWithWeirdErrorMessage = repackResult({
  ErrorDetails: null,
  ErrorMessage: '\n',
  Recno: 123456,
  CaseNumber: '40/12345',
  Successful: true,
  TotalCount: 1,
  TotalPageCount: 1
})

const getCase = {
  Cases: [
    {
      Recno: 123456,
      CaseNumber: '40/12345',
      ExternalId: null,
      Title: 'Elevmappe',
      Date: '',
      Status: 'Under behandling',
      AccessCodeDescription: '',
      AccessCodeCode: '',
      AccessGroup: '',
      Paragraph: '',
      ResponsibleEnterprise: {},
      ResponsibleEnterpriseName: 'NYE VESTFOLD OG TELEMARK FYLKESKOMMUNE 01.01.2020 UNDER FORHÅNDSREGISTRERING',
      ResponsiblePerson: {},
      ResponsiblePersonName: '',
      ArchiveCodes: [],
      Documents: [],
      ReferringCases: null,
      ReferringDocuments: null,
      UnofficialTitle: 'Elevmappe - Roger Hestefjes',
      CreatedDate: '',
      Notes: '',
      CaseTypeCode: 'Elev',
      CaseTypeDescription: 'Elev',
      Contacts: null,
      ProjectRecno: '',
      ProjectName: '',
      SubArchive: '4',
      SubArchiveCode: 'Elev',
      CaseEstates: null,
      CaseRowPermissions: null,
      CustomFields: null,
      LastChangedDate: '',
      ProgressPlan: {},
      SubjectSpecificMetaData: null,
      SubjectSpecificMetaDataNamespace: null,
      URL: 'https://arkivurl.vtfk.no:443'
    },
    {
      Recno: 123457,
      CaseNumber: '40/12346',
      ExternalId: null,
      Title: 'Elevmappe',
      Date: '',
      Status: 'Under behandling',
      AccessCodeDescription: '',
      AccessCodeCode: '',
      AccessGroup: '',
      Paragraph: '',
      ResponsibleEnterprise: {},
      ResponsibleEnterpriseName: 'NYE VESTFOLD OG TELEMARK FYLKESKOMMUNE 01.01.2020 UNDER FORHÅNDSREGISTRERING',
      ResponsiblePerson: {},
      ResponsiblePersonName: '',
      ArchiveCodes: [],
      Documents: [],
      ReferringCases: null,
      ReferringDocuments: null,
      UnofficialTitle: 'Elevmappe - Roger Hestefjes2',
      CreatedDate: '',
      Notes: '',
      CaseTypeCode: 'Elev',
      CaseTypeDescription: 'Elev',
      Contacts: null,
      ProjectRecno: '',
      ProjectName: '',
      SubArchive: '4',
      SubArchiveCode: 'Elev',
      CaseEstates: null,
      CaseRowPermissions: null,
      CustomFields: null,
      LastChangedDate: '',
      ProgressPlan: {},
      SubjectSpecificMetaData: null,
      SubjectSpecificMetaDataNamespace: null,
      URL: 'https://arkivurl.vtfk.no:443'
    },
    {
      Recno: 123458,
      CaseNumber: '40/12347',
      ExternalId: null,
      Title: 'Elevmappe',
      Date: '',
      Status: 'Under behandling',
      AccessCodeDescription: '',
      AccessCodeCode: '',
      AccessGroup: '',
      Paragraph: '',
      ResponsibleEnterprise: {},
      ResponsibleEnterpriseName: 'NYE VESTFOLD OG TELEMARK FYLKESKOMMUNE 01.01.2020 UNDER FORHÅNDSREGISTRERING',
      ResponsiblePerson: {},
      ResponsiblePersonName: '',
      ArchiveCodes: [],
      Documents: [],
      ReferringCases: null,
      ReferringDocuments: null,
      UnofficialTitle: 'Elevmappe - Roger Hestefjes3',
      CreatedDate: '',
      Notes: '',
      CaseTypeCode: 'Elev',
      CaseTypeDescription: 'Elev',
      Contacts: null,
      ProjectRecno: '',
      ProjectName: '',
      SubArchive: '4',
      SubArchiveCode: 'Elev',
      CaseEstates: null,
      CaseRowPermissions: null,
      CustomFields: null,
      LastChangedDate: '',
      ProgressPlan: {},
      SubjectSpecificMetaData: null,
      SubjectSpecificMetaDataNamespace: null,
      URL: 'https://arkivurl.vtfk.no:443'
    }
  ],
  ErrorDetails: null,
  ErrorMessage: null,
  Successful: true,
  TotalCount: 1,
  TotalPageCount: 1
}

const resultCreateCaseWithErrorMessage = repackResult({
  ErrorDetails: null,
  ErrorMessage: 'Error occured in the mainframe :-O',
  Recno: 123456,
  CaseNumber: '40/12345',
  Successful: true,
  TotalCount: 1,
  TotalPageCount: 1
})

const resultPrivatePersonWithEmptyResponse = repackResult({
  PrivatePersons: [],
  TotalPageCount: 0,
  TotalCount: 0,
  Successful: true,
  ErrorMessage: null,
  ErrorDetails: null
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

test('PrivatePerson with empty response is array', () => {
  expect(Array.isArray(resultPrivatePersonWithEmptyResponse)).toBe(true)
})

test('PrivatePerson with empty response is empty array', () => {
  console.log(resultPrivatePersonWithEmptyResponse)
  expect(resultPrivatePersonWithEmptyResponse.length).toBe(0)
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

test('GetCase result with limit set to 1 is returned as Object', () => {
  const result = repackResult(getCase, { limit: 1 })
  expect(typeof result).toBe('object')
  expect(result.Recno).toBe(123456)
  expect(result.CaseNumber).toBe('40/12345')
})

test('GetCase result with limit set to 2 is returned as Array with 2 items', () => {
  const result = repackResult(getCase, { limit: 2 })
  expect(Array.isArray(result)).toBe(true)
  expect(result.length).toBe(2)
  expect(result[0].Recno).toBe(123456)
  expect(result[0].CaseNumber).toBe('40/12345')
  expect(result[1].Recno).toBe(123457)
  expect(result[1].CaseNumber).toBe('40/12346')
})

test('GetCase result with limit set to 5 is returned as Array with 3 items', () => {
  const result = repackResult(getCase, { limit: 5 })
  expect(Array.isArray(result)).toBe(true)
  expect(result.length).toBe(3)
  expect(result[0].Recno).toBe(123456)
  expect(result[0].CaseNumber).toBe('40/12345')
  expect(result[1].Recno).toBe(123457)
  expect(result[1].CaseNumber).toBe('40/12346')
  expect(result[2].Recno).toBe(123458)
  expect(result[2].CaseNumber).toBe('40/12347')
})

test('GetCase result with limit not set is returned as Array with 3 items', () => {
  const result = repackResult(getCase)
  expect(Array.isArray(result)).toBe(true)
  expect(result.length).toBe(3)
  expect(result[0].Recno).toBe(123456)
  expect(result[0].CaseNumber).toBe('40/12345')
  expect(result[1].Recno).toBe(123457)
  expect(result[1].CaseNumber).toBe('40/12346')
  expect(result[2].Recno).toBe(123458)
  expect(result[2].CaseNumber).toBe('40/12347')
})

test('CreateCase result with ErrorMessage is Object', () => {
  expect(typeof resultCreateCaseWithErrorMessage).toBe('object')
})

test('CreateCase result with ErrorMessage has one property only', () => {
  expect(Object.getOwnPropertyNames(resultCreateCaseWithErrorMessage)).toStrictEqual(['ErrorMessage'])
})

test('CreateCase result with ErrorMessage has a "ErrorMessage" property', () => {
  expect(typeof resultCreateCaseWithErrorMessage.ErrorMessage).toBe('string')
  expect(resultCreateCaseWithErrorMessage.ErrorMessage).toBe('Error occured in the mainframe :-O')
})

test('CreateCase result with ErrorMessage "\n" do not have "ErrorMessage" property', () => {
  expect(typeof resultCreateCaseWithWeirdErrorMessage.ErrorMessage).toBe('undefined')
})
