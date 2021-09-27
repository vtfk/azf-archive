# azf-archive

Azure function for archive operations in P360

## API

All calls needs a valid Azure Subscription key

### ```POST /archive```

Common endpoint for all calls.

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

## local.settings.json

```json
{
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "JWT_SECRET": "Noe skikkelig hemmelig",
    "P360_BASE_URL": "http://p360server.domain.no:3001",
    "P360_TOKEN": "bla-bla-bla-bla-123",
    "P360_SECURE_BASE_URL": "http://p360sikkerserver.domain.no:3001",
    "P360_SECURE_TOKEN": "bla-bla-bla-bla-123",
    "PAPERTRAIL_DISABLE_LOGGING": false,
    "PAPERTRAIL_HOST": "logger.papertrailapp.com",
    "PAPERTRAIL_HOSTNAME": "azf-archive",
    "PAPERTRAIL_PORT": 12345
  }
}
```
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
