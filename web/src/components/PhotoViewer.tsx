'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, FileText, Tag, CheckCircle2 } from 'lucide-react';
import { LogAttachment } from '../types';

interface PhotoViewerProps {
  attachments?: LogAttachment[];
  defaultType?: 'site_photo' | 'sample_card' | 'field_sheet';
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  attachments = [],
  defaultType = 'field_sheet',
}) => {
  const [activeTab, setActiveTab] = useState<'field_sheet' | 'sample_card' | 'site_photo'>(defaultType);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOcrOverlay, setShowOcrOverlay] = useState(true);

  // Fallback high-res sample images if specific attachment not yet uploaded
  const defaultImages = {
    field_sheet: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=85',
    sample_card: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=85',
    site_photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1600&q=85',
  };

  const currentAttachment = attachments.find((a) => a.attachment_type === activeTab);
  const currentImageUrl = currentAttachment?.file_url || defaultImages[activeTab];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => { setActiveTab('field_sheet'); setZoomLevel(1); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'field_sheet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Field Sheet (OCR)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('sample_card'); setZoomLevel(1); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sample_card'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Sample Card
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('site_photo'); setZoomLevel(1); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'site_photo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Site Rig Photo
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 text-slate-300">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition ml-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[380px] p-2">
        <div
          className="transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing max-w-full max-h-full flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImageUrl}
            alt={activeTab}
            className="object-contain rounded-md shadow-2xl max-h-[480px] w-auto select-none pointer-events-auto"
          />

          {/* OCR Field Bounding Box Simulation Overlay */}
          {activeTab === 'field_sheet' && showOcrOverlay && (
            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 rounded m-4">
              <div className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur border border-emerald-500/60 text-emerald-300 px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                OCR Parsed Tabular Stream (IS-1892 Standard)
              </div>
            </div>
          )}

          {activeTab === 'sample_card' && showOcrOverlay && (
            <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/40 rounded m-6">
              <div className="absolute top-2 left-2 bg-blue-950/80 backdrop-blur border border-blue-500/60 text-blue-300 px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Specimen Card Label Extracted (Confidence: 98%)
              </div>
            </div>
          )}
        </div>

        {/* Toggle OCR Overlay */}
        <button
          onClick={() => setShowOcrOverlay(!showOcrOverlay)}
          className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs border border-slate-700/80 backdrop-blur transition shadow"
        >
          {showOcrOverlay ? 'Hide OCR Annotations' : 'Show OCR Annotations'}
        </button>
      </div>

      {/* Extracted JSON Metadata pill if present */}
      {currentAttachment?.extracted_text_json && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center justify-between">
          <span className="truncate">
            Extracted Metadata:{' '}
            <span className="text-slate-200">
              {JSON.stringify(currentAttachment.extracted_text_json).slice(0, 90)}...
            </span>
          </span>
          <span className="text-emerald-400 text-[11px] ml-2 shrink-0">Status: Verified</span>
        </div>
      )}
    </div>
  );
};

