const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for testing/development if PostgreSQL is not available
const usePostgres = process.env.USE_POSTGRES === 'true';

let sequelize;

if (usePostgres) {
  // PostgreSQL Configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'nirmaan_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite Configuration (default for testing)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
}

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✓ Database connection established successfully (${usePostgres ? 'PostgreSQL' : 'SQLite'})`);
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    console.log('Note: Make sure PostgreSQL is running or use SQLite for testing');
  }
};

testConnection();

module.exports = sequelize;
