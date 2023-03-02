const repackAddress = (addressList) => {
  return addressList.filter(address => address).join(', ')
}

const repackBrreg = (enterprise) => {
  const adresse = enterprise.forretningsadresse || enterprise.beliggenhetsadresse

  if (!enterprise.postadresse) {
    enterprise.postadresse = adresse
  }

  const repacked = {
    Name: enterprise.navn,
    EnterpriseNumber: enterprise.organisasjonsnummer,
    PostAddress: {
      StreetAddress: repackAddress(enterprise.postadresse.adresse),
      ZipCode: enterprise.postadresse.postnummer,
      ZipPlace: enterprise.postadresse.poststed,
      Country: enterprise.postadresse.land,
      County: enterprise.postadresse.kommune
    },
    OfficeAddress: {
      StreetAddress: repackAddress(adresse.adresse),
      ZipCode: adresse.postnummer,
      ZipPlace: adresse.poststed,
      Country: adresse.land,
      County: adresse.kommune
    },
    DataSource: 'Brreg - SyncEnterprise'
  }

  return repacked
}
module.exports = { repackAddress, repackBrreg }
