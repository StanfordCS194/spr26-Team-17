import { redirect } from 'next/navigation';

// Serve /install-demo/slack as a friendly Next.js route while the actual
// demo lives in the static HTML file served directly by the public folder.
export default function SlackDemoPage() {
  redirect('/install-demo/slack.html');
}
