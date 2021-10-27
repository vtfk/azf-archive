const checkPermissions = require('../lib/archive/checkPermissions')
const { VIEW_PERMISSION } = require('../config')

const { excludeSchools, excludeEnterprises } = VIEW_PERMISSION

const documentWithPermissionsTrue = {
  document: {
    DocumentRowPermissions: '<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Elev Færder vgs</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Elev Færder vgs</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>',
    ResponsibleEnterpriseName: 'FÆRDER VIDEREGÅENDE SKOLE (Underenhet)'
  },
  newSchool: 'Elev Horten vgs'
}

const documentWithOnePermissionsTrue = {
  document: {
    DocumentRowPermissions: '<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Elev Færder vgs</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>',
    ResponsibleEnterpriseName: 'FÆRDER VIDEREGÅENDE SKOLE (Underenhet)'
  },
  newSchool: 'Elev Horten vgs'
}

const documentWithExcludeResponsible = {
  document: {
    DocumentRowPermissions: '<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Elev Færder vgs</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>',
    ResponsibleEnterpriseName: 'Seksjon for pedagogisk psykologisk tjeneste'
  },
  newSchool: 'Elev Horten vgs'
}
const documentWithAlreadyGivenPermission = {
  document: {
    DocumentRowPermissions: '<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Elev Færder vgs</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>',
    ResponsibleEnterpriseName: 'Seksjon for pedagogisk psykologisk tjeneste'
  },
  newSchool: 'Elev Færder vgs'
}

const documentWithExcludeSchool = (school) => {
  const doc = {
    document: {
      DocumentRowPermissions: `<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>${school}</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>`,
      ResponsibleEnterpriseName: 'FÆRDER VIDEREGÅENDE SKOLE (Underenhet)'
    },
    newSchool: 'Elev Færder vgs'
  }
  return doc
}

const documentWithPermissionsFalse = {
  document: {
    DocumentRowPermissions: '<RECORDS RECORDCOUNT="7"><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Seksjon for arkiv og dokumenthåndtering</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD><RECORD COL_HEADER="-1"><Recno>200024</Recno><IsGroup>1</IsGroup><Grantee>Seksjon for teknologi og digitalisering</Grantee><userid></userid><ToOrgUnit></ToOrgUnit><PermNodes><Perm recno="100" granted="1" inhfrom="200024" displayname="Vis fil" systemname="View File">1</Perm></PermNodes><Permissions>Vis fil</Permissions><PermissionIDs>100</PermissionIDs><AccessLevelID>1</AccessLevelID><Locked>-1</Locked><Sticky>0</Sticky><UrpID>562997</UrpID><Ref>Accessgroup</Ref><AccessLevel recno="1" systemname="Read">Lese</AccessLevel><Type>6</Type></RECORD></RECORDS>',
    ResponsibleEnterpriseName: 'FÆRDER VIDEREGÅENDE SKOLE (Underenhet)'
  },
  newSchool: 'Elev Melsom vgs'
}

test('Returns true when a school has view permission for a p360 document', async () => {
  expect(await checkPermissions(documentWithPermissionsTrue.document, documentWithPermissionsTrue.newSchool)).toBe(true)
})

test('Returns false when no school has view permission for a p360 document', async () => {
  expect(await checkPermissions(documentWithPermissionsFalse.document, documentWithPermissionsFalse.newSchool)).toBe(false)
})

test('Document has only one permission, returns true when a school has view permission for a p360 document, and new school should be granted view permission', async () => {
  expect(await checkPermissions(documentWithOnePermissionsTrue.document, documentWithOnePermissionsTrue.newSchool)).toBe(true)
})

test('Document has school view permission, but responsible enterprise is in exludelist', async () => {
  for (const excl of excludeEnterprises) {
    documentWithExcludeResponsible.document.ResponsibleEnterpriseName = excl
    expect(await checkPermissions(documentWithExcludeResponsible.document, documentWithExcludeResponsible.newSchool)).toBe(false)
  }
})

test('Document has school view permission, but school is in excludelist', async () => {
  for (const excl of excludeSchools) {
    const excludeSchool = documentWithExcludeSchool(excl)
    expect(await checkPermissions(excludeSchool.document, excludeSchool.newSchool)).toBe(false)
  }
})

test('School already have view permission', async () => {
  expect(await checkPermissions(documentWithAlreadyGivenPermission.document, documentWithAlreadyGivenPermission.newSchool)).toBe(false)
})
