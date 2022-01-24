module.exports = (enterprise) => {
  const adresse = enterprise.forretningsadresse || enterprise.beliggenhetsadresse

  if (!enterprise.postadresse) {
    enterprise.postadresse = adresse
  }

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
      StreetAddress: adresse.adresse[0],
      ZipCode: adresse.postnummer,
      ZipPlace: adresse.poststed,
      Country: adresse.land,
      County: adresse.kommune
    },
    DataSource: 'Brreg - SyncEnterprise'
  }

  return repacked
}
