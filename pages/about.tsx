import Layout from '@/components/Layout';
import Image from 'next/image';

export default function About() {
  return (
    <Layout title="About - Lixi's Kitchen">
      <div className="bg-gradient-to-br from-primary-50 to-sage-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif font-bold text-neutral-800 mb-4">
            About Me
          </h1>
          <p className="text-xl text-neutral-600">
            Welcome to my kitchen!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="rounded-2xl shadow-lg p-8 md:p-12 mb-12 relative" style={{background: 'linear-gradient(to bottom,rgb(221, 136, 106) 10%, white 70%)'}}>
            {/* Avatar positioned to overlap the card border */}
            <div className="flex justify-center -mt-32 mb-8 relative z-10">
                <Image
                  src="/images/headshot.jpg"
                  alt="Lixi Yang - Culinary Student"
                  width={200}
                  height={200}
                  className="rounded-full"
                  priority
                />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-2">
                Hi, I&apos;m Lixi!
              </h2>
            </div>

            <div className="space-y-6 text-neutral-700 leading-relaxed">
              <p>
                Welcome to my personal cooking journal! I&apos;m passionate about creating 
                delicious meals and sharing my culinary adventures with you.
              </p>

              <p>
                This blog is my space to document favorite recipes, experiment with new 
                flavors, and capture the joy of cooking. From everyday comfort food to 
                special occasion dishes, I believe every meal is an opportunity to create 
                something wonderful.
              </p>

              <h3 className="text-2xl font-serif font-bold text-neutral-800 mt-8 mb-4">
                What You'll Find Here
              </h3>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🍽️</span>
                  <span>
                    <strong>Tested Recipes:</strong> Every recipe is made in my own 
                    kitchen and refined until it's just right
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">📸</span>
                  <span>
                    <strong>Beautiful Photos:</strong> Step-by-step images to guide 
                    you through the cooking process
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <span>
                    <strong>Cooking Tips:</strong> Little tricks and techniques I've 
                    learned along the way
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">❤️</span>
                  <span>
                    <strong>Personal Stories:</strong> The inspiration and memories 
                    behind each dish
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-serif font-bold text-neutral-800 mt-8 mb-4">
                My Cooking Philosophy
              </h3>

              <p>
                I believe cooking should be accessible, enjoyable, and stress-free. 
                You don't need fancy equipment or hard-to-find ingredients to make 
                something delicious. My recipes focus on simple techniques, fresh 
                ingredients, and lots of love.
              </p>

              <p>
                Thank you for visiting my kitchen. I hope you find inspiration here 
                for your next meal. Happy cooking! 🌟
              </p>
            </div>
          </div>

          <div className="bg-sage-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-serif font-bold text-neutral-800 mb-4">
              Let's Connect
            </h3>
            <p className="text-neutral-700 mb-6">
              I'd love to hear from you! Share your cooking experiences, 
              ask questions, or just say hello.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="#" 
                className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                Instagram
              </a>
              <span className="text-neutral-400">•</span>
              <a 
                href="#" 
                className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

