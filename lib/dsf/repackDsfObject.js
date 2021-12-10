module.exports = (dsfPerson) => {
  const repacked = {
    ssn: dsfPerson.FNR,
    oldSsn: dsfPerson.oldSsn ? dsfPerson.oldSsn : dsfPerson.FNR, // fanger opp om det følger med et gammelt fnr her
    firstName: dsfPerson['NAVN-M'] ? `${dsfPerson['NAVN-F']} ${dsfPerson['NAVN-M']}` : `${dsfPerson['NAVN-F']}`,
    lastName: dsfPerson['NAVN-S'],
    streetAddress: dsfPerson.postAdresse.ADR,
    zipCode: dsfPerson.postAdresse.POSTN,
    zipPlace: dsfPerson.postAdresse.POSTS,
    addressType: dsfPerson.SPES,
    addressCode: Number.parseInt(dsfPerson['SPES-KD']),
    residentialAddress: dsfPerson.bostedsAdresse
  }

  return repacked
}
