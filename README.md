# azf-archive

Azure function for archive operations in P360

## API

All calls needs a valid Azure Subscription key

### ```POST /archive - template```

Endpoint for template calls. See [here](#templates) for a complete list of templates

Required fields:
- `system`: Which ***system*** to use
- `template`: Which ***template*** to use
- `parameter`: Parameters for calling ***P360***

Optional fields:
- `parameter.attachments`: List of ***attachments*** to add to P360 Document when using templates with methods 'CreateDocument' or 'UpdateDocument'
- `parameter.contacts`: List of ***contacts*** to add to P360 Project, Case, or Document when using templates with methods 'CreateProject', 'UpdateProject', 'CreateCase', 'UpdateCase', 'CreateDocument', or 'UpdateDocument'

```json
{
  "system": "iop",
  "template": "document",
  "parameter": {
    "accessGroup": "Elev vgs",
    "organizationNumber": "01234",
    "ssn": "01010101010",
    "base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
    "fileFormat": "pdf",
    "displayName": "Bjarne Betjent",
    "caseNumber": "30/99999",
    "documentDate": "2021-09-27",
    "versionNumber": "4.0"
  }
}
```

#### `With attachments and/or contacts`

```json
{
  "system": "iop",
  "template": "document",
  "parameter": {
    "accessGroup": "Elev vgs",
    "organizationNumber": "01234",
    "ssn": "01010101010",
    "base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
    "fileFormat": "pdf",
    "displayName": "Bjarne Betjent",
    "caseNumber": "30/99999",
    "documentDate": "2021-09-27",
    "versionNumber": "4.0",
    "attachments": [ // Optional
      {
        "title": "Et vedlegg",
        "format": "docx",
        "base64": "base64-representation of the file"
      },
      {
        "title": "Enda et vedlegg",
        "format": "msg",
        "base64": "base64-representation of the file"
      }
    ],
    "contacts": [ // Optional
      {
        "ssn": "01010101011", // Valid property names are: "ssn", "recno", and "externalId"
        "role": "mottaker",
        "isUnofficial": true // Can be true, false, or undefined (undefined => false)
      },
      {
        "recno": "12345",
        "role": "avsender"
      },
      {
        "externalID": "78787",
        "role": "avsender",
        "isUnofficial": false
      }
    ]
  }
}
```

### ```POST /archive - raw```

Endpoint for raw SIF calls

Required fields:
- `service`: Which ***SIF service*** to use
- `method`: Which ***method*** from ***SIF service*** to use
- `parameter`: Parameters for calling ***service.method***

Optional fields:
- `secure`: If true, `SECURE P360` will be used; If false or undefined, `REGULAR P360` will be used
- `options`: JSON Object for repack options

#### `Secure`

```json
{
  "service": "ContactService",
  "method": "GetPrivatePersons",
  "secure": true,
  "parameter": {
    "PersonalIdNumber": "01010101010"
  }
}
```

#### `Non-Secure`

```json
{
  "service": "ContactService",
  "method": "GetPrivatePersons",
  "secure": false, // this can be undefined, removed, empty string or 0 as well
  "parameter": {
    "PersonalIdNumber": "01010101010"
  }
}
```

#### `With options`

```json
{
  "service": "CaseService",
  "method": "GetCases",
  "parameter": {
    "ContactReferenceNumber": "01010101010",
    "Title": "Elevmappe"
  },
  "options": {
    "onlyOpenCases": true // see #available-options
  }
}
```

#### `Get first Case`

```json
{
  "service": "CaseService",
  "method": "GetCases",
  "parameter": {
    "ContactReferenceNumber": "01010101010",
    "Title": "Elevmappe"
  },
  "options": {
    "limit": 1 // see #available-options
  }
}
```

#### Available options

| Option | Type | Value | Description |
| ------ | ---- | ----- | ----------- |
| onlyOpenCases | `Boolean` | `true` / `false` | If true, only cases with `Status === 'Under behandling'` will be returned; If false or undefined, all cases will be returned regardless of Status |
| excludeExpiredCases | `Boolean` | `true` / `false` | If true, only cases without `Status === 'Utgår'` will be returned; If false or undefined, all cases will be returned regardless of Status |
| limit | `int` | `1` - `2147483647` | If set to `1`, first occurance will be returned as an `object`. If set to `2` or greater, an array with `limit` amount of items are returned. If set to `0` or not set, the original output will be returned |

#### Supported **services** and their **methods**

- **AccessGroupService**
  - *GetAccessGroups*
- **CaseService**
  - *CreateCase*
  - *GetCases*
  - *UpdateCase*
- **ContactService**
  - *GetContactPersons*
  - *GetEnterprises*
  - *GetPrivatePersons*
  - *SynchronizeContactPerson*
  - *SynchronizeEnterprise*
  - *SynchronizePrivatePerson*
  - *UpdatePrivatePerson*
- **DocumentService**
  - *CreateDocument*
  - *DispatchDocuments*
  - *GetDocuments*
  - *SignOffDocument*
  - *UpdateDocument*
- **EstateService**
  - *GetEstates*
  - *SynchronizeEstate*
- **FileService**
  - *CheckOutAndGetFileForExternalControl*
  - *CreateFile*
  - *DeleteFile*
  - *GetFileWithMetadata*
  - *GetFile*
  - *Upload*
  - *UploadAndCheckInFileFromExternalControl*
  - *UploadFile*
- **MyCasesService**
  - *GetMyCases*
- **ProjectService**
  - *CreateProject*
  - *GetProjects*
  - *UpdateProject*
- **UserService**
  - *GetUsers*
  - *SynchronizeUser*

Full documentation for the **SIF services** can be found [here](https://github.com/vtfk/azf-archive/blob/master/docs/sif-generic-web-service.pdf)

### ```POST /Changes```

Endpoint for changes in IDM

No input or output. Changes will be fetched from IDM

### ```POST /SyncPrivatePerson```
- Create **PrivatePerson** on person if one doesn't exist
- Updates name and address on **PrivatePerson** if one already exists
- Updates ssn for **PrivatePerson** if parameter *oldSsn* is passed, or if new ssn is found in `Det sentrale folkeregister`

Fetches person info from [Det sentrale folkeregister](https://github.com/vtfk/azf-dsf)

#### `With ssn as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With birthdate and name as parameter (only works with one match)`
```json
{
  "birthdate": "010101",
  "firstName": "Per",
  "lastName": "Son"
}
```

#### `Optional: With old ssn and new ssn as parameter (for updating ssn on PrivatePerson)`
Either updates the **PrivatePerson** with new ssn, if person exists on old ssn, or creates new **PrivatePerson** with new ssn
```json
{
  "ssn": "01010101011",
  "oldSsn": "01010101010"
}
```

### ```POST /SyncElevmappe```
- Create **PrivatePerson** on person if one doesn't exist
- Updates name and address on **PrivatePerson** if one already exists
- Updates ssn for **PrivatePerson** if parameter *oldSsn* is passed, or if new ssn is found in `Det sentrale folkeregister`
- Create **Elevmappe** on user if one doesn't exist
- Updates case contact and name on **Elevmappe** if one already exists
- Grants reading permissions to *newSchools* on relevant documents in **Elevmappe** if parameter *newSchools* is passed
- Sends email alert to archive department if there is need for manual operations
Fetches person info from [Det sentrale folkeregister](https://github.com/vtfk/azf-dsf)

#### `With ssn as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With birthdate and name as parameter (only works with one match)`
```json
{
  "birthdate": "010101",
  "firstName": "Per",
  "lastName": "Son"
}
```

#### `Optional: With old ssn and new ssn as parameter (for updating ssn on PrivatePerson)`
Either updates the **PrivatePerson** with new ssn, if person exists on old ssn, or creates new **PrivatePerson** with new ssn
```json
{
  "ssn": "01010101011",
  "oldSsn": "01010101010"
}
```

#### `Optional: With newSchools as parameter, for granting reading permissions for new school(s)`
Must be array of school(s), where each school is the official name of the school. [See available school names here](https://github.com/vtfk/vtfk-schools-info/blob/master/lib/data/schools.json)
```json
{
  "ssn": "01010101011",
  "newSchools": ["Gul videregående skole", "Livets videregående skole"]
}
```

## Templates

Currently available archive templates

| System | Template | Languages | Description |
|--------|----------|-----------|-------------|
| elevmappe | create-elevmappe | nb | Create **Elevmappe** by referencing **social security number**.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-create-elevmappe.json)
| elevmappe | create-private-person | nb | Create **PrivatePerson** in *P360* contact register.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-create-private-person.json)
| elevmappe | get-documents | nb | Get **Documents** archived on a **caseNumber**.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-get-documents.json)
| elevmappe | get-elevmappe | nb | Get **Elevmappe** archived on a **social security number**.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-get-elevmappe.json)
| elevmappe | get-private-person | nb | Get **PrivatePerson** from *P360* contact register by referencing **social security number**.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-get-private-person.json)
| elevmappe | update-elevmappe | nb | Update **PrivatePerson** on **Elevmappe** archived on a **caseNumber**.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-update-elevmappe.json)
| elevmappe | update-private-person | nb | Update **PrivatePerson** in *P360* contact register.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/elevmappe-update-private-person.json)
| iop | hemmelig | nb | Sends a auto generate PDF to school to distribute this manully.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/iop-hemmelig.json)
| iop | document | nb | Archive an IOP on students elevmappe.<br>[JSON template and data format available here](https://github.com/vtfk/azf-archive/blob/master/templates/iop-document.json)

## local.settings.json

```json
{
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "P360_BASE_URL": "http://p360server.domain.no:3001",
    "P360_TOKEN": "bla-bla-bla-bla-123",
    "P360_SECURE_BASE_URL": "http://p360sikkerserver.domain.no:3001",
    "P360_SECURE_TOKEN": "bla-bla-bla-bla-123",
    "P360_VTFK_ROBOT_RECNO": "000000",
    "PAPERTRAIL_HOST": "https://logs.collector.solarwinds.com/v1/log",
    "PAPERTRAIL_TOKEN": "token",
    "NODE_ENV": "production",
    "PDF_GENERATOR": "https://pdf.no/generate",
    "DSF_JWT_SECRET": "Noe skikkelig hemmelig",
    "DSF_URL": "https://dsf.no/lookup",
    "DSF_SAKSREF": "systemref",
    "DB_USER": "db-user",
    "DB_PASSWORD": "db-pass",
    "DB_SERVER": "db-server",
    "DB_DATABASE": "db-db",
    "DB_TABLE": "db-table",
    "E18_URL": "https://e18url.net", // optional
    "E18_KEY": "secret token", // optional
    "E18_SYSTEM": "p360" // optional
  }
}
```

### E18

To support E18, add `E18_URL`, `E18_KEY` and `E18_SYSTEM`

## Deploy

### Azure

You'll need a valid subscription and to setup the following resources

- resource group
- app service plan
- storage account

#### Setup function

The easiest way to make this function run is to setup an app service, configure the app and get the function from GitHub.

- add function app
  - Runtime stack -> Node

Configuration for app (Application settings)
- add values from [local.settings.json](#local.settings.json)

- add function
  - Plattform features -> deployment center
  - github
  - branch master

# Development

Install all tools needed for [local development](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-local).

Clone the repo. Install dependencies (```npm install```)

Create a [local.settings.json](#local.settings.json) file

Start server

```
$ func start
```

# License

[MIT](LICENSE)
