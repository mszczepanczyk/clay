const R = require('ramda')
const { Op } = require('sequelize')

const { sequelize, Profile, Url, Entity } = require('./db')
const { isSocial, normalize } = require('./url')
const { filter, readJSON } = require('./util')

async function addUrl (url, transaction) {
  const normalizedUrl = normalize(url)
  let urlObject = await Url.findOne({
    where: { url: normalizedUrl },
    transaction
  })
  if (!urlObject) {
    urlObject = await Url.create({
      url: normalizedUrl,
      isSocial: isSocial(normalizedUrl)
    }, { transaction })
  }
  // findOrCreate doesn't work with sqlite
  // const [urlObject] = await Url.findOrCreate({
  //   where: { url: normalizedUrl },
  //   defaults: {
  //     isSocial: isSocial(normalizedUrl)
  //   },
  //   transaction
  // })
  return urlObject
}

async function addProfile (profileData, transaction) {
  const url = await addUrl(profileData.url)
  const profile = await Profile.create(profileData, { transaction })
  await profile.setUrl(url, { transaction })
  for (const linkUrl of profileData.linksTo) {
    const link = await addUrl(linkUrl)
    await profile.addLink(link, { transaction })
  }
  return profile
}

async function findProfilesToConnectWith (profile, transaction) {
  const url = await profile.getUrl({ transaction })
  const links = await profile.getLink({ transaction })

  // new profile's url + all links
  const allProfileUrlsIds = [url, ...links].map(u => u.id)

  // filter saved urls by the ones from a new profile and retrieve connected profiles
  const associatedUrls = await Url.findAll({
    where: { id: allProfileUrlsIds },
    include: [
      { model: Profile, as: 'link' },
      { model: Profile }
    ],
    transaction
  })

  // potential profile associations
  const potentialProfiles = R.uniqBy(u => u.id, [
    ...associatedUrls.map(url => url.profiles),
    ...associatedUrls.map(url => url.link)
  ].flat())

  const profilesToConnectWith = await filter(potentialProfiles, async pp => {
    // ignore self references
    if (pp.id === profile.id) {
      return false
    }

    if (pp.entityType === 'uncategorized' || pp.entityType !== profile.entityType) {
      return false
    }

    const ppUrl = await pp.getUrl({ transaction })
    const ppLinks = await pp.getLink({ transaction })
    const connectedOneWay = ppLinks.map(l => l.id).includes(url.id)
    const connectedOtherWay = links.map(l => l.id).includes(ppUrl.id)
    const notSocial = !url.isSocial || !ppUrl.isSocial

    if (notSocial && !(connectedOneWay && connectedOtherWay)) {
      return false
    }

    if (!connectedOneWay && !connectedOtherWay) {
      return false
    }

    return true
  })

  return profilesToConnectWith
}

function getEntitiesFromProfiles (profiles, transaction) {
  return Promise.all(profiles.map(p => p.getEntity({ transaction }))).then(entities => {
    return entities.filter(e => e) // non-empty
  }).then(entities => {
    return R.uniqBy(e => e.id, entities) // unique
  })
}

function processOneProfile (profileData) {
  return sequelize.transaction(async transaction => {
    const profile = await addProfile(profileData, transaction)
    const profilesToConnectWith = await findProfilesToConnectWith(profile, transaction)
    if (profilesToConnectWith.length > 0) {
      const entities = await getEntitiesFromProfiles(profilesToConnectWith, transaction)
      const targetEntity = await Entity.create({ entityType: profile.entityType })
      await profile.setEntity(targetEntity, { transaction })

      // update profiles with new entity
      await Profile.update({
        entityId: targetEntity.id
      }, {
        where: {
          [Op.or]: [
            { entityId: entities.map(e => e.id) }, // merge entities
            { id: profilesToConnectWith.map(p => p.id) } // set entities on profiles not associated with any
          ]
        },
        transaction
      })

      // clear empty entities
      if (entities.length > 0) {
        await Entity.destroy({
          where: {
            id: entities.map(e => e.id)
          },
          transaction
        })
      }
    }
    return profile
  })
}

async function processProfiles (profilesData) {
  const profiles = []
  for (const pd of profilesData) {
    const p = await processOneProfile(pd)
    profiles.push(p)
  }
  return profiles
}

async function processFile (path) {
  await sequelize.sync({ force: true }) // TODO
  const profilesData = await readJSON(path)
  await processProfiles(profilesData)
  const entities = await Entity.findAll({
    include: [{
      model: Profile,
      include: Url
    }]
  })
  const freeProfiles = await Profile.findAll({
    where: {
      entityId: null
    },
    include: Url
  })
  await sequelize.close()
  return { entities, freeProfiles }
}

module.exports = {
  processProfiles, processFile
}
