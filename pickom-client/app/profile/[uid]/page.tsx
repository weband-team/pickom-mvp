import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ uid: "1" }];
}


export default async function Page({ params }: { params: Promise<{ uid: string }> }) {
  return <PageClient params={params} />;
}
