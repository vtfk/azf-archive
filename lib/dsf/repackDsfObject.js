const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

const capitalizeWords = (string) => {
  const stringList = string.split(' ')
  const res = []
  for (const str of stringList) {
    const dashList = str.split('-') // Some names have dashes in them, we want to capitalize here as well
    const res2 = []
    for (const dash of dashList) {
      res2.push(capitalize(dash))
    }
    res.push(res2.join('-'))
  }
  return res.join(' ')
}

module.exports = (dsfPerson) => {
  const repacked = {
    ssn: `${dsfPerson.FODT}${dsfPerson.PERS}`,
    oldSsn: dsfPerson.oldSsn ? dsfPerson.oldSsn : `${dsfPerson.FODT}${dsfPerson.PERS}`,
    firstName: dsfPerson['NAVN-M'] ? `${capitalizeWords(dsfPerson['NAVN-F'])} ${capitalizeWords(dsfPerson['NAVN-M'])}` : `${capitalizeWords(dsfPerson['NAVN-F'])}`,
    lastName: capitalizeWords(dsfPerson['NAVN-S']),
    streetAddress: capitalize(dsfPerson.SPES),
    zipCode: '_9999',
    zipPlace: 'UKJENT',
    addressType: 'normal',
    addressCode: Number.parseInt(dsfPerson['SPES-KD'])
  }

  const addressBlockCodes = ['6', '7']

  if (addressBlockCodes.includes(dsfPerson['SPES-KD'])) {
    repacked.addressType = capitalize(dsfPerson.SPES)
    // postStreetAddress: adrBlock.postbox,
    // postZipCode: adrBlock.zipcode,
    // postZipPlace: adrBlock.zipplace,
  } else if (dsfPerson['SPES-KD'] === '4') {
    repacked.addressType = 'klientadresse'
    // postStreetAddress: dsfPerson['ADR-T'] ? `${dsfPerson['ADR-T']}\n${capitalizeWords(dsfPerson.ADR)}` : capitalizeWords(dsfPerson.ADR),
    // postZipCode: dsfPerson.POSTN,
    // postZipPlace: capitalizeWords(dsfPerson.POSTS),
  } else if (dsfPerson.STAT === 'UTVANDRET') { // Må håndteres manuelt til vi finner ut hvordan utenlandske adresser fungerer i DSF -> 360 -> SvarUT...
    repacked.streetAddress = 'Utvandret'
    repacked.addressType = 'utvandret'
  } else {
    if (dsfPerson.ADR) repacked.streetAddress = capitalizeWords(dsfPerson.ADR)
    if (dsfPerson.ADR1) repacked.streetAddress = capitalizeWords(dsfPerson.ADR1)
    if (dsfPerson.POSTN) repacked.zipCode = capitalizeWords(dsfPerson.POSTN)
    if (dsfPerson.ADR2) repacked.zipCode = capitalizeWords(dsfPerson.ADR2)
    if (dsfPerson.POSTS) repacked.zipPlace = capitalizeWords(dsfPerson.POSTS)
    if (dsfPerson.ADR3) repacked.zipPlace = capitalizeWords(dsfPerson.ADR3)
  }

  return repacked
}
