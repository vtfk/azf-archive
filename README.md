# (WIP) azf-p360

Azure function for P360

## API

### ```GET /call```

Common endpoint for all calls. 

Required fields:
- `service`: Which ***SIF service*** to use
- `method`: Which ***method*** from ***SIF service*** to use
- `parameter`: Parameters for calling ***service.method***

Optional fields:
- `secure`: If true, SECURE P360 will be used; If false or undefined, regular P360 will be used
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
  "secure": false, // this can be undefined, removed, empty string or 0 as well
  "parameter": {
    "ContactReferenceNumber": "01010101010",
    "Title": "Elevmappe"
  },
  "options": {
    "onlyOpenCases": true // If true, only cases with Status === 'Under behandling' will be returned; If false or undefined, all cases will be returned regardless of Status
  }
}
```

#### Supported **services** and their **methods**

All **services** has a `ping` endpoint which can be used to test that you have access to the service, that it is correctly installed, and that your user has at least read permission to P360.
If it returns without throwing an exception, the service is ok.

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
- **DocumentService**
  - *CreateDocument*
  - *GetDocuments*
  - *SignOffDocument*
  - *UpdateDocument*
- **EstateService**
  - *GetEstates*
  - *SynchronizeEstate*
- **FileService**
  - *CheckOutAndGetFileForExternalControl*
  - *Upload*
  - *UploadAndCheckInFileFromExternalControl*
- **MyCasesService**
  - *GetMyCases*
- **ProjectService**
  - *CreateProject*
  - *GetProjects*
  - *UpdateProject*
- **UserService**
  - *GetUsers*
  - *SynchronizeUser*

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
    "PAPERTRAIL_HOSTNAME": "azf-p360",
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
