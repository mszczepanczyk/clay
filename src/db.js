const { Sequelize } = require('sequelize')

const uri = process.env.DB_IN_MEMORY === 'true'
  ? 'sqlite::memory:'
  : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/${process.env.POSTGRES_DBNAME}`

const sequelize = new Sequelize(uri, {
  define: {
    timestamps: false
  },
  logging: process.env.DEBUG === 'true'
})

const Url = sequelize.define('url', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  url: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  isSocial: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
})

const EntityType = Sequelize.ENUM('person', 'organization', 'uncategorized')

const Profile = sequelize.define('profile', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  entityType: {
    type: EntityType,
    allowNull: false
  }
})

Profile.belongsTo(Url)
Url.hasMany(Profile)
Profile.belongsToMany(Url, { as: 'link', through: 'profile_links' })
Url.belongsToMany(Profile, { as: 'link', through: 'profile_links' })

const Entity = sequelize.define('entity', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  entityType: {
    type: EntityType,
    allowNull: false
  }
})

Profile.belongsTo(Entity)
Entity.hasMany(Profile)

module.exports = {
  sequelize, Entity, Profile, Url
}
