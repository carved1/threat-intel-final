const sequelize = require('./config');
const { Sha256, Url, IpPort, User } = require('./models');

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Creating tables...');
    await sequelize.sync({ force: true });
    console.log('All tables created successfully!');

    console.log('\nDatabase setup complete!');
    console.log('You can now run: npm run seed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
