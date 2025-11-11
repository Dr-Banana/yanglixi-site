import Layout from '@/components/Layout';
import ActivityCarousel, { ActivityItem } from '@/components/ActivityCarousel';
import HolidayGrid from '@/components/HolidayGrid';
import { getActivitiesFromR2 } from '@/lib/activity';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';

interface HomePageProps {
  activities: ActivityItem[];
  isAdmin: boolean;
}

export default function HomePage({ activities, isAdmin }: HomePageProps) {
  return (
    <Layout title="Lixi's Kitchen" isAdmin={isAdmin}>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-sage-50 py-12 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-2">
            My Kitchen Diary
          </h1>
          <p className="text-lg text-neutral-600">
            Documenting delicious food, sharing life
          </p>
        </div>
      </div>

      {/* My Activity Section */}
      <div className="bg-white py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-3">
                My Activity
              </h2>
              <p className="text-neutral-600">
                Recent food activities and daily moments
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin/activities"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Manage Activities
              </Link>
            )}
          </div>
          {activities.length > 0 ? (
            <ActivityCarousel items={activities} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No activities yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Home Kitchen Section - Holiday Categories */}
      <div className="bg-gradient-to-b from-neutral-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-3">
                Home Kitchen
              </h2>
              <p className="text-neutral-600">
                Explore holiday recipes and family feast traditions
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin/home-kitchen"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Manage Posts
              </Link>
            )}
          </div>

          <HolidayGrid />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Check if admin session exists
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  const isAdmin = !!session;

  // Fetch activities from R2
  let activities: ActivityItem[] = [];
  if (process.env.R2_BUCKET) {
    try {
      // Public users only see published activities
      const activitiesData = await getActivitiesFromR2({ includeDrafts: false });
      // Map to ActivityItem format
      const allActivities = activitiesData.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        image: a.image,
        location: a.location || null, // Convert undefined to null for JSON serialization
        link: a.link || null, // Convert undefined to null for JSON serialization
      }));
      
      // Take only the first 5 activities (or all if less than 5)
      activities = allActivities.slice(0, Math.min(5, allActivities.length));
    } catch (error) {
      console.error('Error fetching activities:', error);
      // If error occurs, set to empty array (won't cause errors, will show empty state)
      activities = [];
    }
  }

  return {
    props: { activities, isAdmin },
  };
};
