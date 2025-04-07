import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

console.log('Global test setup completed');