const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const HTTPError = require('../http-error')

const newFakeSsn = (birthdate, gender, runningNumber) => {
  const newBirthdate = `${Number(birthdate.substring(0, 1)) + 4}${birthdate.substring(1, 6)}`
  if (runningNumber < 10) runningNumber = `0${runningNumber}`
  const genderNumber = gender === 'M' ? 1 : 2
  const countyNumber = 38
  return `${newBirthdate}${runningNumber}${genderNumber}${countyNumber}`
}

module.exports = async (birthdate, gender, lastName) => {
  if (!lastName) {
    logger('error', ['Missing required parameter "lastName"'])
    throw new HTTPError(400, 'Missing required parameter "lastName"')
  }
  if (!birthdate) {
    logger('error', ['Missing required parameter "birthdate"'])
    throw new HTTPError(400, 'Missing required parameter "birthdate"')
  }
  if (!gender) {
    logger('error', ['Missing required parameter "gender"'])
    throw new HTTPError(400, 'Missing required parameter "gender"')
  }

  let foundUnique = false
  let runningNumber = 99
  let resultSsn
  while (!foundUnique) {
    const fakeSsn = newFakeSsn(birthdate, gender, runningNumber)
    const privatePersonRes = await callTemplateData('elevmappe', 'get-private-person', { ssn: fakeSsn })
    if (privatePersonRes.length === 1 && privatePersonRes[0].LastName === lastName) {
      foundUnique = true
      resultSsn = fakeSsn
    } else if (privatePersonRes.length === 0) {
      foundUnique = true
      resultSsn = fakeSsn
    } else {
      runningNumber -= 1
      // Consider to add sleep function, if it fails a lot
    }
  }

  return resultSsn
}
