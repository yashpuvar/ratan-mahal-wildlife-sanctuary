import { useState } from 'react';
import { IMAGE_FALLBACK, resolveImageUrl } from '../lib/imageUrl';

export default function SiteImage(props) {
  const src = resolveImageUrl(props.src);
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  return <img {...props} src={failed ? IMAGE_FALLBACK : src}
    onError={() => { if (!failed) setFailedSrc(src); }} />;
}
