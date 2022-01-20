module.exports = (enterprise) => {
  const repacked = {
    Name: enterprise.navn,
    EnterpriseNumber: enterprise.organisasjonsnummer,
    PostAddress: {
      StreetAddress: enterprise.postadresse.adresse[0],
      ZipCode: enterprise.postadresse.postnummer,
      ZipPlace: enterprise.postadresse.poststed,
      Country: enterprise.postadresse.land,
      County: enterprise.postadresse.kommune
    },
    OfficeAddress: {
      StreetAddress: enterprise.forretningsadresse.adresse[0],
      ZipCode: enterprise.forretningsadresse.postnummer,
      ZipPlace: enterprise.forretningsadresse.poststed,
      Country: enterprise.forretningsadresse.land,
      County: enterprise.forretningsadresse.kommune
    },
    DataSource: 'Brreg - SyncEnterprise'
  }

  return repacked
}
