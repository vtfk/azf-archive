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

const resultCreateCaseWithErrorMessageFromP360 = repackResult({
  ErrorDetails: null,
  ErrorMessage: "Error sending object CreateDocumentTransaction () to receiver SI.Data._360.Receivers.Transaction.CreateDocumentReceiver (C:\\Program Files (x86)\\Tieto\\360\\_instances\\VTFKTEST\\webservices\\SI.WS.Core\\bin\\SI.Data.360.dll): System.Exception: Error executing statement: (($((#A8BA4524-35CF-4DE3-81EC-E0AF987E89CD#))*Access Group is not a valid for the entity and subtype. AccessGroup=$))'200693'\n<operation><INSERTSTATEMENT ENTITY=\"Document\" ID=\"b05bb485-accd-4c09-af00-88dfa73f8732\" NAMESPACE=\"SIRIUS\"><METAITEM NAME=\"ToCase\"><VALUE>234464</VALUE></METAITEM><METAITEM NAME=\"Title\"><VALUE>Kort spørsmål: Hva er status for alkoholdservering på fylkeskommunens regning?</VALUE></METAITEM><METAITEM NAME=\"UnofficialTitle\"><VALUE>Kort spørsmål: Hva er status for alkoholdservering på fylkeskommunens regning?</VALUE></METAITEM><METAITEM NAME=\"ToDocumentArchive\"><VALUE>2</VALUE></METAITEM><METAITEM NAME=\"ToDocumentCategory\"><VALUE>60005</VALUE></METAITEM><METAITEM NAME=\"ToJournalStatus\"><VALUE>6</VALUE></METAITEM><METAITEM NAME=\"ToOrgUnit\"><VALUE>237034</VALUE></METAITEM><METAITEM NAME=\"ToAuthorization\"><VALUE>Offl. § 14</VALUE></METAITEM><METAITEM NAME=\"ToAccessCode\"><VALUE>200003</VALUE></METAITEM><METAITEM NAME=\"ToAccessGroup\"><VALUE>200693</VALUE></METAITEM><METAITEM NAME=\"DocumentDate\"><VALUE>22.11.2021 00:00:00</VALUE></METAITEM><METAITEM NAME=\"Paper\"><VALUE>0</VALUE></METAITEM><METAITEM NAME=\"Recno\"><VALUE>[PLACEHOLDER(163efccc-6077-4617-ad0f-0621dbe365f0,Document)]</VALUE></METAITEM></INSERTSTATEMENT><BATCH ID=\"b05bb485-accd-4c09-af00-88dfa73f8732\"><INSERTSTATEMENT ENTITY=\"Version\" ID=\"86a399ea-e278-4580-9f25-58cf7436e81f\" NAMESPACE=\"SIRIUS\" /><BATCH ID=\"86a399ea-e278-4580-9f25-58cf7436e81f\" /></BATCH></operation> ---> SI.Util.BizInfoException: (($((#A8BA4524-35CF-4DE3-81EC-E0AF987E89CD#))*Access Group is not a valid for the entity and subtype. AccessGroup=$))'200693'\r\n   at SI.Biz.Core.AccessGroup.AccessGroupValidation.ValidateAccessGroupForEntityAndSubtype(String entity, Int32 entitysubtype, Int32 accessgroup)\r\n   at SI.Biz.Core.Document.DocumentMetaHandler.ValidateAccessGroupValue()\r\n   at SI.Biz.Core.Document.DocumentMetaInsert.ValidateAccessGroup()\r\n   at SI.Biz.Core.MetaExecution.MetaManager.ExecuteValidation(Action action, enumValidationType validationtype)\r\n   at SI.Biz.Core.Document.DocumentMetaInsert.Validate()\r\n   at SI.Biz.Core.MetaExecution.MetaManager.InternalValidate()\r\n   at SI.Biz.Core.MetaExecution.MetaOperationManager.<>c.<RunValidateOnOperationTree>b__19_0(MetaManager x, MetaOperation o)\r\n   at SI.Biz.Core.MetaExecution.MetaOperationManager.RunOperationFunctionOnManagers(IList`1 managers, MetaOperation operation, ManagerOperationFunction func)\r\n   at SI.Biz.Core.MetaExecution.MetaOperationManager.RunManagerOnOperationTree(MetaOperation operation, ManagerOperationFunction func)\r\n   at SI.Biz.Core.MetaExecution.MetaOperationManager.RunOperations(Boolean skipValidation, Boolean skipAccessControl)\r\n   at SI.Biz.Core.MetaActionOperation.ExecuteSingleAction(String xmlOpr)\r\n   at SI.Data._360._360AppFabricAdapter.ExecuteAction(String statement, Boolean single, Boolean skipValidation, Boolean skipAccessControl) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Adapters\\360AppFabricAdapter.cs:line 204\r\n   --- End of inner exception stack trace ---\r\n   at SI.Data._360._360AppFabricAdapter.ExecuteAction(String statement, Boolean single, Boolean skipValidation, Boolean skipAccessControl) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Adapters\\360AppFabricAdapter.cs:line 241\r\n   at SI.Data._360._360AppFabricAdapter.MetaInsert(String insertStatement, Boolean skipValidation) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Adapters\\360AppFabricAdapter.cs:line 81\r\n   at SI.Data._360._360AppFabricAdapter.MetaInsert(MetaStatement insertStatement, Boolean skipValidation) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Adapters\\360AppFabricAdapter.cs:line 71\r\n   at SI.Data._360.Operations.DocumentOperation.Insert() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Operations\\Common\\DocumentOperation.cs:line 52\r\n   at SI.Data._360.Operations.Transaction.InsertDocumentTransactionOperation.Insert() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Operations\\Transaction\\InsertDocumentTransactionOperation.cs:line 24\r\n   at SI.Data._360.Receivers.Transaction.CreateDocumentReceiver.DoTransaction() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Receivers\\Transaction\\CreateDocumentReceiver.cs:line 17\r\n   at SI.Data._360.Receivers.Transaction.TransactionObjectReceiverBase`1.<>c__DisplayClass3_0.<ReceiveInternal>b__0() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Receivers\\Transaction\\TransactionObjectReceiverBase.cs:line 42\r\n   at SI.Data._360.Utils.TransactionHelper.RunInTransaction(Action action) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Utils\\TransactionHelper.cs:line 48\r\n   at SI.Data._360.Receivers.Transaction.TransactionObjectReceiverBase`1.ReceiveInternal() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Receivers\\Transaction\\TransactionObjectReceiverBase.cs:line 47\r\n   at SI.Data._360.Receivers.ReceiverBase`1.Receive() in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.360\\Receivers\\ReceiverBase.cs:line 61\r\n   at SI.Data.DataDispatcher.DispatchObjectToPlugin(ISIDataObject dataObject, Object plugin) in d:\\a\\1\\s\\Source\\SI.Data\\SI.Data.Core\\DataDispatcher.cs:line 345",
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

test('CreateCase result with ErrorMessage has "error" and "message" property', () => {
  expect(Object.getOwnPropertyNames(resultCreateCaseWithErrorMessage)).toStrictEqual(['error', 'message'])
})

test('CreateCase result with ErrorMessage has a "error" property', () => {
  expect(typeof resultCreateCaseWithErrorMessage.error).toBe('string')
  expect(resultCreateCaseWithErrorMessage.error).toBe('Error occured in the mainframe :-O')
})

test('CreateCase result with ErrorMessage has a "message" property', () => {
  expect(typeof resultCreateCaseWithErrorMessage.message).toBe('string')
  expect(resultCreateCaseWithErrorMessage.message).toBe('Error occured in the mainframe :-O')
})

test('CreateCase result with ErrorMessage "\n" do not have "ErrorMessage" property', () => {
  expect(typeof resultCreateCaseWithWeirdErrorMessage.error).toBe('undefined')
})

test('CreateCase result with ErrorMessage from P360 do not have quotes inside', () => {
  expect(resultCreateCaseWithErrorMessageFromP360.error.indexOf('"')).toBe(-1)
  expect(resultCreateCaseWithErrorMessageFromP360.error.indexOf("'")).toBe(-1)
})
