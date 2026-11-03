import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveImageUrl, IMAGE_FALLBACK } from '../src/lib/imageUrl.js';
import { getPostPhoto } from '../src/lib/postEditorial.js';
const backend = 'https://ratan-mahal-backend.onrender.com';
test('public assets stay on frontend including public and relative paths', () => {
 for (const path of ['/images/hotel/wooden-cottage.jpg', 'images/hotel/wooden-cottage.jpg', './images/hotel/wooden-cottage.jpg', '/public/images/hotel/wooden-cottage.jpg']) {
  assert.equal(resolveImageUrl(path), '/images/hotel/wooden-cottage.jpg');
 }
});
test('visitor and upload paths use backend including legacy localhost', () => {
 for (const path of ['/api/gallery/visitor/image/abc', 'api/gallery/visitor/image/abc', 'http://localhost:5000/api/gallery/visitor/image/abc']) assert.equal(resolveImageUrl(path), backend + '/api/gallery/visitor/image/abc');
 assert.equal(resolveImageUrl('/uploads/photo.jpg'), backend + '/uploads/photo.jpg');
 assert.equal(resolveImageUrl('http://localhost:5173/images/hotel/deluxe-room.jpg'), '/images/hotel/deluxe-room.jpg');
});
test('external, signed, preview and secure URL handling', () => {
 const secure = 'https://cdn.example.com/photo.jpg?signature=a%2Fb&v=1';
 assert.equal(resolveImageUrl(secure), secure);
 assert.equal(resolveImageUrl('http://cdn.example.com/photo.jpg'), 'https://cdn.example.com/photo.jpg');
 assert.equal(resolveImageUrl('//cdn.example.com/photo.jpg'), 'https://cdn.example.com/photo.jpg');
 assert.equal(resolveImageUrl('blob:https://example.com/abc'), 'blob:https://example.com/abc');
 assert.equal(resolveImageUrl('data:image/png;base64,abc'), 'data:image/png;base64,abc');
 for (const value of [null, undefined, '', '  ', 'javascript:alert(1)']) assert.equal(resolveImageUrl(value), IMAGE_FALLBACK);
});
test('saved post image survives selection', () => {
 const image = 'https://cdn.example.com/original.jpg';
 assert.equal(getPostPhoto({image}).src, image);
});

test('legacy absolute backend public assets return to the frontend while uploads stay on backend', () => {
 for (const path of ['/images/posts/forested-hills-landscape.jpg', '/public/images/posts/forested-hills-landscape.jpg']) {
  assert.equal(resolveImageUrl(backend + path), '/images/posts/forested-hills-landscape.jpg');
 }
 assert.equal(resolveImageUrl(backend + '/api/gallery/visitor/image/abc'), backend + '/api/gallery/visitor/image/abc');
});

test('Pexels originals are bounded for mobile without rewriting signed or custom query strings', () => {
 const url = 'https://images.pexels.com/photos/24589420/pexels-photo-24589420.jpeg';
 assert.equal(resolveImageUrl(url), url + '?auto=compress&cs=tinysrgb&w=1600');
 assert.equal(resolveImageUrl(url + '?signature=a%2Fb&w=800'), url + '?signature=a%2Fb&w=800');
});
