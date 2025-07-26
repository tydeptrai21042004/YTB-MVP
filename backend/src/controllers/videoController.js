const Video     = require('../models/Video');
const History   = require('../models/History');
const fs        = require('fs');
const path      = require('path');
const { GoogleGenAI } = require('@google/genai');

// Gemini client reads GEMINI_API_KEY from env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, kind } = req.body;
    if (!req.file || !title) {
      return res.status(400).json({ error: 'File and title are required' });
    }
    const k = kind === 'short' ? 'short' : 'regular';
    const vid = new Video({
      originalName: req.file.originalname,
      filename:     req.file.filename,
      title,
      description,
      url:          `/uploads/${req.file.filename}`,
      uploadedBy:   req.user.id,
      kind:         k
    });
    await vid.save();
    res.json(vid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listVideos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.q) filter.title = new RegExp(req.query.q, 'i');
    if (req.query.kind) filter.kind = req.query.kind === 'short' ? 'short' : 'regular';
    const videos = await Video.find(filter)
      .sort('-uploadedAt')
      .populate('uploadedBy', 'name');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    // increment viewCount
    const vid = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('uploadedBy', 'name email');
    if (!vid) return res.status(404).json({ error: 'Video not found' });

    // record history
    if (req.user && req.user.id) {
      await History.create({ user: req.user.id, video: vid._id });
    }

    res.json(vid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.postSummary = async (req, res) => {
  try {
    const vid = await Video.findById(req.params.id);
    if (!vid) return res.status(404).json({ error: 'Video not found' });
    if (vid.kind !== 'regular') {
      return res.status(400).json({ error: 'Summary only for regular videos' });
    }

    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
      return res.status(400).json({ error: 'Transcript too short' });
    }

    const prompt = `
Summarize this video in 2–3 sentences.

Title: ${vid.title}
Description: ${vid.description || '[no description]'}

Transcript:
${transcript.trim()}
    `.trim();

    console.log('postSummary: prompt=', prompt.slice(0,200), '…');
    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });
    const summary = aiRes[0]?.text?.trim() || '';
    console.log('postSummary: summary=', summary);

    res.json({ summary });
  } catch (err) {
    console.error('postSummary error:', err);
    res.status(500).json({ error: err.message });
  }
};
exports.deleteVideo = async (req, res) => {
  try {
    const vid = await Video.findById(req.params.id);
    if (!vid) return res.status(404).json({ error: 'Video not found' });
    if (vid.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const filePath = path.join(__dirname, '../../uploads', vid.filename);
    fs.unlink(filePath, err => { if (err) console.error(err); });
    await vid.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
