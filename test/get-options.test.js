const getOptions = require('../lib/get-options')

const methods = [
  {
    method: 'CreateCase',
    limit: true
  },
  {
    method: 'UpdateCase',
    limit: true
  },
  {
    method: 'SynchronizePrivatePerson',
    limit: true
  },
  {
    method: 'SignOffDocument',
    limit: true
  },
  {
    method: 'DeleteCase',
    limit: true
  },
  {
    method: 'GetFile',
    limit: true
  },
  {
    method: 'UploadFile',
    limit: true
  },
  {
    method: 'GetCases',
    limit: false
  },
  {
    method: 'DispatchDocuments',
    limit: false
  }
]

methods.forEach(({ method, limit }) => {
  test(`Method '${method}' should set 'limit' to 1`, () => {
    const options = getOptions({}, method)
    expect(typeof options).toBe('object')
    if (limit) {
      expect(typeof options.limit).toBe('number')
      expect(options.limit).toBe(1)
    } else expect(typeof options.limit).toBe('undefined')
  })
})
