import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import models
const { default: Category } = await import('../src/models/Category.js');
const { default: Tag } = await import('../src/models/Tag.js');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  const defaultCategories = [
    // Technology & Programming
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile Development', slug: 'mobile-development' },
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
    { name: 'Blockchain', slug: 'blockchain' },
    
    // Business & Finance
    { name: 'Startups', slug: 'startups' },
    { name: 'Entrepreneurship', slug: 'entrepreneurship' },
    { name: 'Digital Marketing', slug: 'digital-marketing' },
    { name: 'Finance & Investing', slug: 'finance-investing' },
    
    // Lifestyle & Personal Development
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Mental Health', slug: 'mental-health' },
    { name: 'Career Development', slug: 'career-development' },
    { name: 'Travel', slug: 'travel' },
    
    // Education & Learning
    { name: 'Programming Tutorials', slug: 'programming-tutorials' },
    { name: 'Online Learning', slug: 'online-learning' },
    { name: 'Language Learning', slug: 'language-learning' },
    
    // Design & Creativity
    { name: 'UI/UX Design', slug: 'ui-ux-design' },
    { name: 'Graphic Design', slug: 'graphic-design' },
    { name: 'Photography', slug: 'photography' },
    
    // Opinion
    { name: 'Opinion', slug: 'opinion' },
    
    // Science & Research
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Scientific Research', slug: 'scientific-research' },
  ];

  for (const category of defaultCategories) {
    await Category.findOneAndUpdate(
      { slug: category.slug },
      category,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ Categories checked/created successfully');
};

const seedTags = async () => {
  const defaultTags = [
    // Programming Languages
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Python', slug: 'python' },
    { name: 'Java', slug: 'java' },
    { name: 'C#', slug: 'csharp' },
    { name: 'PHP', slug: 'php' },
    { name: 'Ruby', slug: 'ruby' },
    { name: 'Go', slug: 'go' },
    { name: 'Rust', slug: 'rust' },
    { name: 'Swift', slug: 'swift' },
    { name: 'Kotlin', slug: 'kotlin' },
    
    // Web Technologies
    { name: 'React', slug: 'react' },
    { name: 'Vue', slug: 'vue' },
    { name: 'Angular', slug: 'angular' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'Express', slug: 'express' },
    { name: 'Django', slug: 'django' },
    { name: 'Flask', slug: 'flask' },
    { name: 'Laravel', slug: 'laravel' },
    { name: 'Spring', slug: 'spring' },
    { name: 'GraphQL', slug: 'graphql' },
    { name: 'REST API', slug: 'rest-api' },
    
    // Mobile Development
    { name: 'React Native', slug: 'react-native' },
    { name: 'Flutter', slug: 'flutter' },
    { name: 'iOS', slug: 'ios' },
    { name: 'Android', slug: 'android' },
    
    // AI & Data Science
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Deep Learning', slug: 'deep-learning' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Neural Networks', slug: 'neural-networks' },
    { name: 'Computer Vision', slug: 'computer-vision' },
    { name: 'NLP', slug: 'nlp' },
    
    // Design & UX
    { name: 'UI Design', slug: 'ui-design' },
    { name: 'UX Design', slug: 'ux-design' },
    { name: 'Figma', slug: 'figma' },
    { name: 'Adobe XD', slug: 'adobe-xd' },
    { name: 'Sketch', slug: 'sketch' },
    
    // Career & Productivity
    { name: 'Career Advice', slug: 'career-advice' },
    { name: 'Remote Work', slug: 'remote-work' },
    { name: 'Freelancing', slug: 'freelancing' },
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Time Management', slug: 'time-management' },
    
    // Technology Trends
    { name: 'Web3', slug: 'web3' },
    { name: 'Metaverse', slug: 'metaverse' },
    { name: 'AR/VR', slug: 'ar-vr' },
    { name: 'IoT', slug: 'iot' },
    { name: 'DevOps', slug: 'devops' },
    { name: 'Cloud', slug: 'cloud' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
    { name: 'Blockchain', slug: 'blockchain' },
    
    // Learning & Education
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Beginners', slug: 'beginners' },
    { name: 'Learning', slug: 'learning' },
    { name: 'Resources', slug: 'resources' },
    { name: 'Tips & Tricks', slug: 'tips-tricks' },
    
    // Opinion & Society
    { name: 'Economy', slug: 'economy' },
    { name: 'GDP', slug: 'gdp' },
    { name: 'Growth', slug: 'growth' },
    { name: 'Development', slug: 'development' },
    { name: 'India', slug: 'india' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Awareness', slug: 'awareness' },
    { name: 'Society', slug: 'society' },
  ];

  for (const tag of defaultTags) {
    await Tag.findOneAndUpdate(
      { slug: tag.slug },
      tag,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ Tags checked/created successfully');
};

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check existing categories and tags
    const categories = await Category.find();
    const tags = await Tag.find();

    console.log('\n📋 Existing Categories:');
    console.table(categories.map(c => ({ _id: c._id, name: c.name, slug: c.slug })));
    
    console.log('\n🏷️  Existing Tags:');
    console.table(tags.map(t => ({ _id: t._id, name: t.name, slug: t.slug })));

    // Seed data if collections are empty
    if (categories.length === 0) {
      console.log('\nNo categories found. Seeding default categories...');
      await seedCategories();
    }

    if (tags.length === 0) {
      console.log('\nNo tags found. Seeding default tags...');
      await seedTags();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Main function to run the seeding process
const main = async () => {
  try {
    await connectDB();
    await seedCategories();
    await seedTags();
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    process.exit(1);
  }
};

// Run the main function
main();
