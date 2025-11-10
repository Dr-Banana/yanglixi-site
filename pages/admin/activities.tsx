import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Activity, getActivitiesFromR2 } from '@/lib/activity';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';

interface ActivitiesPageProps {
  activities: Activity[];
  isAdmin: boolean;
}

export default function ActivitiesPage({ activities: initialActivities, isAdmin }: ActivitiesPageProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <Layout title="Unauthorized" isAdmin={false}>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
          <p>You need to be logged in as admin to access this page.</p>
        </div>
      </Layout>
    );
  }

  const handleNew = () => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: '',
      description: '',
      image: '',
      location: null,
      link: null,
      date: new Date().toISOString(),
      order: 0,  // Order is no longer used for sorting
      published: false,
    };
    setEditing(newActivity);
    setImagePreview('');
  };

  const handleEdit = (activity: Activity) => {
    setEditing({ ...activity });
    setImagePreview(activity.image || '');
    setOpenMenuId(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });

      const response = await fetch('/api/admin/activities/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: editing?.id,
          image: base64,
          contentType: file.type,
        }),
      });

      const data = await response.json();
      if (data.imageUrl && editing) {
        setEditing({ ...editing, image: data.imageUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const response = await fetch('/api/admin/activities/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });

      if (response.ok) {
        router.reload();
      } else {
        alert('Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await fetch('/api/admin/activities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });

      if (response.ok) {
        setActivities(activities.filter(a => a.id !== activityId));
      } else {
        alert('Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    }
  };

  return (
    <Layout title="Manage Activities" isAdmin={isAdmin}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Activities</h1>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editing.id.startsWith('activity-') && activities.every(a => a.id !== editing.id) ? 'New Activity' : 'Edit Activity'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editing.date ? new Date(editing.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditing({ ...editing, date: new Date(e.target.value).toISOString() })}
                    className="w-full border rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Activities are sorted by date (newest first). The latest 5 published activities will show on the homepage.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location (optional)</label>
                  <input
                    type="text"
                    value={editing.location || ''}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value || null })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Los Angeles, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link (optional)</label>
                  <input
                    type="text"
                    value={editing.link || ''}
                    onChange={(e) => setEditing({ ...editing, link: e.target.value || null })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-full h-48">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published-checkbox"
                      checked={editing.published}
                      onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <label htmlFor="published-checkbox" className="text-sm font-medium">Published</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Only published activities will appear on the homepage. Draft activities are hidden from public view.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-6">
          {/* Create New Activity Card */}
          <div 
            onClick={handleNew}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-dashed border-neutral-300 hover:border-primary-400 flex items-center justify-center min-h-[150px] cursor-pointer group"
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-700 group-hover:text-primary-600 transition-colors">
                Create New Activity
              </h3>
            </div>
          </div>

          {/* Activities Grouped by Year */}
          {(() => {
            // Group activities by year
            const grouped: { [year: string]: typeof activities } = {};
            activities.forEach(activity => {
              const year = new Date(activity.date).getFullYear().toString();
              if (!grouped[year]) grouped[year] = [];
              grouped[year].push(activity);
            });
            
            // Sort years descending
            const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));
            
            return years.map(year => (
              <div key={year}>
                {/* Year Header */}
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">{year}</h2>
                
                {/* Activities in this year */}
                <div className="space-y-4">
                  {grouped[year].map((activity) => {
                    const activityDate = new Date(activity.date);
                    const month = activityDate.toLocaleDateString('en-US', { month: 'short' });
                    const day = activityDate.getDate();
                    
                    return (
                      <div key={activity.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-neutral-100">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Date & Location */}
                          <div className="md:w-32 flex-shrink-0">
                            <div className="text-xl font-semibold text-neutral-800 mb-3">
                              <span className="text-2xl">{day}</span> {month}.
                            </div>
                            {activity.location && (
                              <div className="text-sm text-neutral-600 flex items-start gap-1">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="line-clamp-2">{activity.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Center: Image */}
                          <div className="relative w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                            {activity.image ? (
                              <Image
                                src={activity.image}
                                alt={activity.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Right: Content & Actions */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-neutral-800 flex-1 line-clamp-2">{activity.title}</h3>
                              
                              {/* Status & Menu */}
                              <div className="flex items-center gap-2 ml-2">
                                {activity.published && (
                                  <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white whitespace-nowrap">
                                    ✓ PUBLIC
                                  </div>
                                )}
                                
                                {/* Three Dots Menu */}
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === activity.id ? null : activity.id)}
                                    className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                                    aria-label="More options"
                                  >
                                    <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                    </svg>
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {openMenuId === activity.id && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-10"
                                        onClick={() => setOpenMenuId(null)}
                                      />
                                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[120px] z-20">
                                        <button
                                          onClick={() => {
                                            handleEdit(activity);
                                            setOpenMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                                        >
                                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleDelete(activity.id);
                                            setOpenMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>No activities yet. Click "New Activity" to create one.</p>
          </div>
        )}
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

  let activities: Activity[] = [];
  if (process.env.R2_BUCKET) {
    try {
      activities = await getActivitiesFromR2({ includeDrafts: true });
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }

  return {
    props: { activities, isAdmin },
  };
};

