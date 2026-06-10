import { redirect } from 'next/navigation';

// Serve /install-demo/instagram as a friendly Next.js route while the actual
// demo lives in the static HTML file served directly by the public folder.
export default function InstagramDemoPage() {
  redirect('/install-demo/instagram.html');
}
