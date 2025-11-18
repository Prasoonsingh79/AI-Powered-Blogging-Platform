const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Category = require('../src/models/Category');
const Tag = require('../src/models/Tag');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  addData();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function addData() {
  try {
    // Add Opinion category if it doesn't exist
    const opinionCategory = await Category.findOneAndUpdate(
      { slug: 'opinion' },
      { name: 'Opinion', slug: 'opinion' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Category added/updated:', opinionCategory);

    // Add tags
    const tagsToAdd = [
      'Economy', 'GDP', 'Growth', 'Development', 
      'India', 'Finance', 'Awareness', 'Society'
    ];

    const addedTags = [];
    for (const tagName of tagsToAdd) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      const tag = await Tag.findOneAndUpdate(
        { slug },
        { name: tagName, slug },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      addedTags.push(tag);
      console.log(`✅ Tag added/updated: ${tag.name}`);
    }

    console.log('\n🎉 Data addition completed successfully!');
    console.log(`- Added/Updated Category: ${opinionCategory.name}`);
    console.log(`- Added/Updated ${addedTags.length} tags`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding data:', error);
    process.exit(1);
  }
}
