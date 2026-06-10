import { redirect } from 'next/navigation';

// Keep /install-demo as a friendly route while serving the actual static HTML file.
export default function InstallDemoPage() {
  redirect('/install-demo/index.html');
}
