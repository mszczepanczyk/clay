/* eslint-env jest */

const { sequelize, Profile, Entity } = require('../db')
const { processProfiles } = require('../process')

beforeAll(() => {
  expect(process.env.DB_IN_MEMORY).toBe('true')
})

beforeEach(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})

test('one profile', async () => {
  await processProfiles([{
    url: 'http://foo.com',
    entityType: 'person',
    linksTo: [
      'http://bar.com'
    ]
  }])
  const profiles = await Profile.findAll()
  expect(profiles.length).toBe(1)
  const profile = profiles[0]
  expect(profile.entityType).toBe('person')
  const url = await profile.getUrl()
  expect(url.url).toBe('foo.com')
  expect(url.isSocial).toBe(false)
  const { count: entitiesCount } = await Entity.findAndCountAll()
  expect(entitiesCount).toBe(0)
})

test('one way link social', async () => {
  const profiles = await processProfiles([
    {
      url: 'https://www.twitter.com/aaa',
      entityType: 'organization',
      linksTo: [
        'https://www.facebook.com/aaa'
      ]
    },
    {
      url: 'https://www.facebook.com/aaa',
      entityType: 'organization',
      linksTo: []
    }
  ])
  expect(profiles.length).toBe(2)
  const entities = await Entity.findAll()
  expect(entities.length).toBe(1)
})

test('two way link non-social', async () => {
  const profiles = await processProfiles([
    {
      url: 'https://www.twitter.com/aaa',
      entityType: 'person',
      linksTo: [
        'https://example.com'
      ]
    },
    {
      url: 'https://www.example.com',
      entityType: 'person',
      linksTo: [
        'https://twitter.com/aaa'
      ]
    }
  ])
  expect(profiles.length).toBe(2)
  const entities = await Entity.findAll()
  expect(entities.length).toBe(1)
})

test('uncategorized', async () => {
  await processProfiles([
    {
      url: 'facebook.com/1',
      entityType: 'uncategorized',
      linksTo: [
        'facebook.com/2'
      ]
    },
    {
      url: 'facebook.com/2',
      entityType: 'uncategorized',
      linksTo: [
        'facebook.com/1'
      ]
    }
  ])
  expect((await Profile.findAndCountAll()).count).toBe(2)
  expect((await Entity.findAndCountAll()).count).toBe(0)
})

test('merge entities', async () => {
  await processProfiles([
    {
      url: 'twitter.com/1',
      entityType: 'person',
      linksTo: []
    },
    {
      url: 'twitter.com/2',
      entityType: 'person',
      linksTo: [
        'twitter.com/1'
      ]
    }
  ])
  expect((await Profile.findAndCountAll()).count).toBe(2)
  expect((await Entity.findAndCountAll()).count).toBe(1)
  await processProfiles([
    {
      url: 'twitter.com/3',
      entityType: 'person',
      linksTo: []
    },
    {
      url: 'twitter.com/4',
      entityType: 'person',
      linksTo: [
        'twitter.com/3'
      ]
    }
  ])
  expect((await Profile.findAndCountAll()).count).toBe(4)
  expect((await Entity.findAndCountAll()).count).toBe(2)
  await processProfiles([
    {
      url: 'twitter.com/5',
      entityType: 'person',
      linksTo: [
        'twitter.com/1',
        'twitter.com/4'
      ]
    }
  ])
  expect((await Profile.findAndCountAll()).count).toBe(5)
  expect((await Entity.findAndCountAll()).count).toBe(1)
})
