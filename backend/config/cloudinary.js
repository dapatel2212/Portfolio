const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for certificates (PDF + images)
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `portfolio-platform/certificates/${req.user.id}`,
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: `cert_${Date.now()}`,
  }),
});

// Storage for profile photos
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `portfolio-platform/photos`,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: `photo_${req.user.id}`,
  }),
});

// Storage for project screenshots
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `portfolio-platform/projects/${req.user.id}`,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
    public_id: `project_${Date.now()}`,
  }),
});

const uploadCertificate = multer({
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadProjectImage = multer({
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadCertificate, uploadPhoto, uploadProjectImage };
