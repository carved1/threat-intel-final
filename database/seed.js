const fs = require('fs');
const path = require('path');
const sequelize = require('./config');
const { Sha256, Url, IpPort } = require('./models');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  return new Date(dateStr);
}

async function seedSha256() {
  console.log('Seeding SHA256 hashes...');
  const filePath = path.join(__dirname, '..', 'full_sha256.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  let count = 0;
  const batchSize = 100;
  let batch = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 14) continue;
    
    try {
      batch.push({
        ioc_id: values[1],
        ioc_value: values[2],
        threat_type: values[4],
        malware: values[5] === 'None' ? null : values[5],
        malware_printable: values[7],
        confidence_level: parseInt(values[9]) || 0,
        first_seen_utc: parseDate(values[0]),
        last_seen_utc: parseDate(values[8]),
        reference: values[10] === 'None' ? null : values[10],
        tags: values[11] === 'None' ? null : values[11],
        reporter: values[13]
      });
      
      if (batch.length >= batchSize) {
        await Sha256.bulkCreate(batch, { ignoreDuplicates: true });
        count += batch.length;
        batch = [];
        console.log(`  Processed ${count} SHA256 records...`);
      }
    } catch (error) {
      console.error(`Error processing line ${i}:`, error.message);
    }
  }
  
  if (batch.length > 0) {
    await Sha256.bulkCreate(batch, { ignoreDuplicates: true });
    count += batch.length;
  }
  
  console.log(`✓ Seeded ${count} SHA256 hashes`);
}

async function seedUrls() {
  console.log('Seeding URLs...');
  const filePath = path.join(__dirname, '..', 'full_urls.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  let count = 0;
  const batchSize = 100;
  let batch = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 14) continue;
    
    try {
      batch.push({
        ioc_id: values[1],
        ioc_value: values[2],
        threat_type: values[4],
        malware: values[5] === 'None' ? null : values[5],
        malware_printable: values[7],
        confidence_level: parseInt(values[9]) || 0,
        first_seen_utc: parseDate(values[0]),
        last_seen_utc: parseDate(values[8]),
        reference: values[10] === 'None' ? null : values[10],
        tags: values[11] === 'None' ? null : values[11],
        reporter: values[13]
      });
      
      if (batch.length >= batchSize) {
        await Url.bulkCreate(batch, { ignoreDuplicates: true });
        count += batch.length;
        batch = [];
        console.log(`  Processed ${count} URL records...`);
      }
    } catch (error) {
      console.error(`Error processing line ${i}:`, error.message);
    }
  }
  
  if (batch.length > 0) {
    await Url.bulkCreate(batch, { ignoreDuplicates: true });
    count += batch.length;
  }
  
  console.log(`✓ Seeded ${count} URLs`);
}

async function seedIpPorts() {
  console.log('Seeding IP:Port combinations...');
  const filePath = path.join(__dirname, '..', 'full_ip-port.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  let count = 0;
  const batchSize = 100;
  let batch = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 14) continue;
    
    try {
      batch.push({
        ioc_id: values[1],
        ioc_value: values[2],
        threat_type: values[4],
        malware: values[5] === 'None' ? null : values[5],
        malware_printable: values[7],
        confidence_level: parseInt(values[9]) || 0,
        first_seen_utc: parseDate(values[0]),
        last_seen_utc: parseDate(values[8]),
        reference: values[10] === 'None' ? null : values[10],
        tags: values[11] === 'None' ? null : values[11],
        reporter: values[13]
      });
      
      if (batch.length >= batchSize) {
        await IpPort.bulkCreate(batch, { ignoreDuplicates: true });
        count += batch.length;
        batch = [];
        console.log(`  Processed ${count} IP:Port records...`);
      }
    } catch (error) {
      console.error(`Error processing line ${i}:`, error.message);
    }
  }
  
  if (batch.length > 0) {
    await IpPort.bulkCreate(batch, { ignoreDuplicates: true });
    count += batch.length;
  }
  
  console.log(`✓ Seeded ${count} IP:Port combinations`);
}

async function seed() {
  try {
    console.log('Starting database seeding...\n');
    await sequelize.authenticate();
    
    await seedSha256();
    await seedUrls();
    await seedIpPorts();
    
    console.log('\n✓ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
