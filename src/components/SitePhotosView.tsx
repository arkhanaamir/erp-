import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { SitePhotoItem } from '../types';
import {
  Camera,
  Plus,
  Calendar,
  MapPin,
  Tag,
  Filter,
  Eye,
  Download,
  X
} from 'lucide-react';

export const SitePhotosView: React.FC = () => {
  const { sitePhotos, addSitePhoto, activeProjectId, activeProject } = useCasabuild();

  const [locationFilter, setLocationFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhotoItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [imgUrl, setImgUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [locationTag, setLocationTag] = useState('Living Room');
  const [activityTag, setActivityTag] = useState('Finishes');

  const filteredPhotos = sitePhotos.filter(p => {
    const matchLoc = locationFilter === 'All' || p.location === locationFilter;
    const matchAct = activityFilter === 'All' || p.activity === activityFilter;
    return matchLoc && matchAct;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrl || !caption) return;
    addSitePhoto({
      projectId: activeProjectId,
      imageUrl: imgUrl,
      caption,
      location: locationTag,
      activity: activityTag,
      date: new Date().toISOString().split('T')[0],
      uploadedBy: 'Site Supervisor Tariq'
    });
    setShowUploadModal(false);
    setImgUrl('');
    setCaption('');
  };

  const locations = ['All', 'Exterior / Facade', 'Ground Floor Slab', 'Living Room', 'Master Bedroom', 'Kitchen', 'Bathrooms'];
  const activities = ['All', 'Civil & Concrete', 'Brickwork', 'Electrical Conduit', 'Plumbing', 'Plastering', 'Finishes'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 7
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl font-['Outfit',sans-serif]">
              Site Photo Journal & Visual Timeline
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            High-resolution visual archives tagged by date, architectural location, and trade activity.
          </p>
        </div>

        <button
          id="photos-upload-btn"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Camera className="h-4 w-4 stroke-[2.5]" />
          <span>Upload Site Image</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-zinc-500 uppercase font-semibold text-[10px] shrink-0">Location:</span>
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={`shrink-0 rounded-xl px-2.5 py-1 text-xs transition ${
                locationFilter === loc
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        <div className="text-zinc-400 text-xs">
          Showing <span className="font-semibold text-zinc-200">{filteredPhotos?.length || 0}</span> documented photos
        </div>
      </div>

      {/* Photos Masonry / Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPhotos.map(photo => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-[#161922] transition hover:border-amber-500/40 shadow-xl"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
              <img
                src={photo.imageUrl}
                alt={photo.caption}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2.5 left-2.5 flex space-x-1.5">
                <span className="rounded-lg bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-zinc-700">
                  {photo.location}
                </span>
                <span className="rounded-lg bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-zinc-200 border border-zinc-700">
                  {photo.activity}
                </span>
              </div>
              <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] text-zinc-300 border border-zinc-800">
                {photo.date}
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition line-clamp-2">
                {photo.caption}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <span>By: {photo.uploadedBy}</span>
                <span className="flex items-center text-amber-400">
                  <Eye className="h-3 w-3 mr-1" /> View Full
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full rounded-2xl border border-zinc-800 bg-[#161922] overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-300 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.caption}
              className="w-full max-h-[60vh] object-cover"
            />
            <div className="p-5 text-xs text-zinc-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                    {selectedPhoto.location}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-200 border border-zinc-700">
                    {selectedPhoto.activity}
                  </span>
                </div>
                <span className="text-zinc-400">{selectedPhoto.date}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{selectedPhoto.caption}</p>
              <p className="text-[11px] text-zinc-400">Uploaded by: {selectedPhoto.uploadedBy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Upload Site Image</h3>
            <form onSubmit={handleUpload} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="Paste Unsplash or direct image URL..."
                  value={imgUrl}
                  onChange={e => setImgUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Work Description / Caption</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Master bath waterproof screed and concealed Grohe diverter"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Location / Zone</label>
                  <input
                    type="text"
                    value={locationTag}
                    onChange={e => setLocationTag(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Activity Tag</label>
                  <input
                    type="text"
                    value={activityTag}
                    onChange={e => setActivityTag(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-1.5 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition">
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
